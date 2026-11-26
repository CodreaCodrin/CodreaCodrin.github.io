using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Microsoft.Win32.SafeHandles;

namespace PortfolioEditor
{
    public sealed class Dimensions
    {
        public int width { get; set; }
        public int height { get; set; }
    }

    public sealed class Entry
    {
        public string id { get; set; }
        public string title { get; set; }
        public string image { get; set; }
        public string alt { get; set; }
        public string description { get; set; }
        public decimal? rating { get; set; }
        public bool netflix { get; set; }
        public string[] streamingServices { get; set; }
    }

    public sealed class StreamingService
    {
        public string id { get; set; }
        public string label { get; set; }
    }

    public sealed class Collection
    {
        public string filename { get; set; }
        public string kind { get; set; }
        public string title { get; set; }
        public string revision { get; set; }
        public string route { get; set; }
        public string discoveryId { get; set; }
        public Dimensions aspect { get; set; }
        public List<Entry> items { get; set; }
    }

    public sealed class Reply
    {
        public string error { get; set; }
        public List<Collection> collections { get; set; }
        public List<StreamingService> streamingServices { get; set; }
        public Collection collection { get; set; }
        public string id { get; set; }
        public string image { get; set; }
        public int width { get; set; }
        public int height { get; set; }
        public string log { get; set; }
    }

    internal sealed class Backend
    {
        private readonly string script;

        public Backend()
        {
            using (var reader = new StreamReader(Assembly.GetExecutingAssembly().GetManifestResourceStream("editor_backend.mjs")))
                script = reader.ReadToEnd();
        }

        public async Task<Reply> Request(object request, string project)
        {
            var serializer = new JavaScriptSerializer { MaxJsonLength = 24 * 1024 * 1024 };
            var payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(serializer.Serialize(request)));
            var configuration = new ProcessStartInfo("node.exe", "--input-type=module -")
            {
                WorkingDirectory = project,
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8,
            };
            using (var process = Process.Start(configuration))
            {
                var output = process.StandardOutput.ReadToEndAsync();
                var errors = process.StandardError.ReadToEndAsync();
                using (var input = new StreamWriter(process.StandardInput.BaseStream, new UTF8Encoding(false)))
                {
                    await input.WriteAsync(script);
                    await input.WriteLineAsync("\nawait main('" + payload + "');");
                }
                await Task.WhenAll(output, errors);
                if (String.IsNullOrWhiteSpace(output.Result))
                    throw new InvalidOperationException(String.IsNullOrWhiteSpace(errors.Result) ? "Node.js nu a răspuns." : errors.Result.Trim());
                var reply = serializer.Deserialize<Reply>(output.Result);
                if (!String.IsNullOrEmpty(reply.error)) throw new InvalidOperationException(reply.error);
                return reply;
            }
        }
    }

    internal sealed class DevServer
    {
        private static readonly Regex LocalAddress = new Regex(@"Local:\s*(http://127\.0\.0\.1:\d+/)");
        private readonly StringBuilder log = new StringBuilder();
        private Process process;
        private SafeFileHandle processJob;
        private TaskCompletionSource<string> address;

        public string Log { get { lock (log) return log.ToString(); } }
        public bool IsRunning { get { return process != null && !process.HasExited; } }
        public event EventHandler Exited;

        public async Task<string> Start(string project)
        {
            if (IsRunning) return await Ready();
            Stop();
            lock (log) log.Clear();
            var ready = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
            address = ready;
            var settings = new ProcessStartInfo(Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe",
                "/d /c set /p PORTFOLIO_EDITOR_START= && npm.cmd run dev -- --host 127.0.0.1")
            {
                WorkingDirectory = project,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            };
            settings.EnvironmentVariables["NO_COLOR"] = "1";
            var next = new Process { StartInfo = settings, EnableRaisingEvents = true };
            next.OutputDataReceived += (sender, e) => OnOutput(e.Data, ready);
            next.ErrorDataReceived += (sender, e) => OnOutput(e.Data, ready);
            next.Exited += (sender, e) =>
            {
                ready.TrySetException(new InvalidOperationException("Serverul Vite s-a oprit. Verifică jurnalul."));
                var exited = Exited;
                if (exited != null) exited(this, EventArgs.Empty);
            };
            var nextJob = CreateDevJob();
            try
            {
                next.Start();
                // Wait on stdin so npm and its children start inside the job.
                if (!AssignProcessToJobObject(nextJob, next.Handle))
                {
                    var error = new Win32Exception();
                    next.StandardInput.Close();
                    throw error;
                }
                process = next;
                processJob = nextJob;
                next.BeginOutputReadLine();
                next.BeginErrorReadLine();
                next.StandardInput.WriteLine("start");
                next.StandardInput.Close();
                return await Ready();
            }
            catch
            {
                if (process == next) Stop();
                else
                {
                    next.Dispose();
                    nextJob.Dispose();
                }
                throw;
            }
        }

        private async Task<string> Ready()
        {
            var deadline = Task.Delay(TimeSpan.FromSeconds(20));
            if (await Task.WhenAny(address.Task, deadline) == deadline)
                throw new TimeoutException("Vite nu a afișat adresa locală în 20 de secunde. Verifică jurnalul.");
            return await address.Task;
        }

        private void OnOutput(string line, TaskCompletionSource<string> ready)
        {
            if (line == null) return;
            AppendLog(line);
            var match = LocalAddress.Match(line);
            if (match.Success) ready.TrySetResult(match.Groups[1].Value);
        }

        private void AppendLog(string line)
        {
            lock (log)
            {
                log.AppendLine(line);
                if (log.Length > 10000) log.Remove(0, log.Length - 10000);
            }
        }

        public bool Stop()
        {
            if (process == null) return true;
            if (IsRunning && !TerminateJobObject(processJob, 1) && IsRunning)
            {
                AppendLog(new Win32Exception().Message);
                return false;
            }
            if (!process.WaitForExit(3000))
            {
                AppendLog("Oprirea serverului nu s-a finalizat în 3 secunde.");
                return false;
            }
            processJob.Dispose();
            process.Dispose();
            processJob = null;
            process = null;
            return true;
        }

        private static SafeFileHandle CreateDevJob()
        {
            var job = CreateJobObject(IntPtr.Zero, null);
            if (job.IsInvalid) throw new Win32Exception();
            var limits = new JobLimits { Basic = new BasicJobLimits { Flags = 0x2000 } }; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
            if (SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf(typeof(JobLimits)))) return job;
            var error = new Win32Exception();
            job.Dispose();
            throw error;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct BasicJobLimits
        {
            public long ProcessTime, JobTime;
            public uint Flags;
            public UIntPtr MinWorkingSet, MaxWorkingSet;
            public uint ActiveProcesses;
            public UIntPtr Affinity;
            public uint PriorityClass, SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct JobLimits
        {
            public BasicJobLimits Basic;
            public ulong ReadOperations, WriteOperations, OtherOperations, ReadBytes, WriteBytes, OtherBytes;
            public UIntPtr ProcessMemory, JobMemory, PeakProcessMemory, PeakJobMemory;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern SafeFileHandle CreateJobObject(IntPtr attributes, string name);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool SetInformationJobObject(SafeFileHandle job, int informationClass, ref JobLimits limits, uint length);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool AssignProcessToJobObject(SafeFileHandle job, IntPtr processHandle);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool TerminateJobObject(SafeFileHandle job, uint exitCode);
    }
}
