using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace PortfolioEditor
{
    internal static class Program
    {
        [STAThread]
        private static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new EditorForm(args.Length > 0 ? args[0] : null));
        }
    }

    internal sealed class EditorForm : Form
    {
        internal static readonly Color Background = Color.FromArgb(21, 25, 30);
        internal static readonly Color PanelColor = Color.FromArgb(29, 34, 40);
        internal static readonly Color InputColor = Color.FromArgb(40, 47, 55);
        internal static readonly Color TextColor = Color.FromArgb(240, 244, 246);
        internal static readonly Color MutedColor = Color.FromArgb(174, 190, 198);
        internal static readonly Color AccentColor = Color.FromArgb(124, 226, 188);
        private readonly Backend backend = new Backend();
        private readonly DevServer server = new DevServer();
        private readonly ComboBox collections = new ComboBox();
        private readonly ListBox entries = new ListBox();
        private readonly TextBox title = new TextBox();
        private readonly TextBox alt = new TextBox();
        private readonly TextBox description = new TextBox { Multiline = true, ScrollBars = ScrollBars.Vertical, Height = 82 };
        private readonly NumericUpDown rating = new NumericUpDown { Minimum = 0, Maximum = 5, DecimalPlaces = 2, Increment = 0.5M };
        private readonly TableLayoutPanel streamingOptions = new TableLayoutPanel { ColumnCount = 2, AutoSize = true };
        private readonly Label projectLabel = TextLabel("Alege folderul proiectului", true);
        private readonly Label entryLabel = TextLabel("Intrare nouă", false);
        private readonly Label imageLabel = TextLabel("Alege o imagine", true);
        private readonly Label status = TextLabel("", true);
        private readonly Button saveButton = ActionButton("Salvează", true);
        private readonly Button openButton = ActionButton("Deschide site-ul");
        private readonly Button stopButton = ActionButton("Închide site-ul");
        private readonly Button deployButton = ActionButton("Deploy");
        private readonly Button folderButton = ActionButton("Alege folderul");
        private readonly Button reloadButton = ActionButton("Reîncarcă");
        private readonly CoverPreview preview = new CoverPreview();
        private readonly TableLayoutPanel body;
        private readonly Control descriptionSection;
        private readonly Control ratingSection;
        private readonly Control streamingSection;
        private readonly ToolTip tips = new ToolTip();
        private readonly string settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PortfolioEditor", "project.txt");
        private readonly string initialProject;
        private string project;
        private Collection active;
        private Entry selected;
        private string pickedImage;
        private string lastLog;
        private string lastOpened;
        private bool dirty;
        private bool binding;
        private bool busy;
        private int previewRequest;

        public EditorForm(string initialProject)
        {
            this.initialProject = initialProject;
            Text = "Portfolio Editor";
            ClientSize = new Size(1120, 675);
            MinimumSize = new Size(960, 630);
            StartPosition = FormStartPosition.CenterScreen;
            AutoScaleMode = AutoScaleMode.Dpi;
            Font = new Font("Segoe UI", 10F);
            BackColor = Background;
            ForeColor = TextColor;

            var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Padding = new Padding(22, 14, 22, 12) };
            root.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
            root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            root.RowStyles.Add(new RowStyle(SizeType.Absolute, 54));
            Controls.Add(root);
            root.Controls.Add(BuildHeader(), 0, 0);

            body = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 3, RowCount = 1, Margin = Padding.Empty };
            body.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 244));
            body.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 53));
            body.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 47));
            root.Controls.Add(body, 0, 1);
            body.Controls.Add(BuildList(), 0, 0);

            StyleInput(title);
            StyleInput(alt);
            StyleInput(description);
            rating.BackColor = InputColor;
            rating.ForeColor = TextColor;
            rating.Width = 100;
            descriptionSection = Field("Descriere", description);
            ratingSection = Field("Rating din 5", rating, false);
            streamingOptions.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
            streamingOptions.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
            streamingSection = Field("Servicii de streaming", streamingOptions);
            body.Controls.Add(BuildEditor(), 1, 0);
            body.Controls.Add(BuildPreview(), 2, 0);
            root.Controls.Add(BuildFooter(), 0, 2);

            collections.SelectedIndexChanged += CollectionsChanged;
            entries.SelectedIndexChanged += EntriesChanged;
            title.TextChanged += DraftChanged;
            alt.TextChanged += DraftChanged;
            description.TextChanged += DraftChanged;
            rating.ValueChanged += DraftChanged;
            folderButton.Click += ChooseProject;
            reloadButton.Click += async (sender, e) => { if (project != null && ConfirmDiscard()) await LoadProject(project); };
            saveButton.Click += SaveEntry;
            openButton.Click += async (sender, e) => await OpenSite(true);
            stopButton.Click += StopSite;
            server.Exited += SiteExited;
            deployButton.Click += DeploySite;
            tips.SetToolTip(deployButton, "Optimizează imaginile și publică versiunea salvată pe GitHub Pages.");
            Shown += async (sender, e) =>
            {
                var folder = FindProject(this.initialProject) ?? RememberedProject() ?? FindProject(AppDomain.CurrentDomain.BaseDirectory);
                if (folder != null) await LoadProject(folder);
                else SetBusy(false);
            };
            FormClosing += ClosingEditor;
            SetBusy(false);
        }

        private Control BuildHeader()
        {
            var header = new TableLayoutPanel { Dock = DockStyle.Fill, Margin = Padding.Empty, ColumnCount = 2, RowCount = 1 };
            header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var heading = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2, Margin = Padding.Empty };
            heading.RowStyles.Add(new RowStyle(SizeType.Absolute, 38));
            heading.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            var name = TextLabel("Portfolio Editor", false);
            name.Font = new Font("Segoe UI Semibold", 19F);
            name.Dock = DockStyle.Fill;
            name.TextAlign = ContentAlignment.MiddleLeft;
            heading.Controls.Add(name, 0, 0);
            projectLabel.AutoEllipsis = true;
            projectLabel.Dock = DockStyle.Top;
            heading.Controls.Add(projectLabel, 0, 1);
            var actions = new FlowLayoutPanel { Dock = DockStyle.Top, AutoSize = true, WrapContents = false, Margin = new Padding(0, 8, 0, 0) };
            actions.Controls.Add(reloadButton);
            actions.Controls.Add(folderButton);
            header.Controls.Add(heading, 0, 0);
            header.Controls.Add(actions, 1, 0);
            return header;
        }

        private Control BuildList()
        {
            var panel = Column(0, 12);
            panel.RowCount = 4;
            panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 24));
            panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 38));
            panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 48));
            panel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            panel.Controls.Add(TextLabel("Colecție", true), 0, 0);
            collections.DropDownStyle = ComboBoxStyle.DropDownList;
            collections.DisplayMember = "title";
            collections.Dock = DockStyle.Top;
            collections.BackColor = InputColor;
            collections.ForeColor = TextColor;
            collections.FlatStyle = FlatStyle.Flat;
            collections.AccessibleName = "Colecție";
            panel.Controls.Add(collections, 0, 1);
            var add = ActionButton("+ Intrare nouă");
            add.Dock = DockStyle.Fill;
            add.Margin = new Padding(0, 1, 0, 10);
            add.Click += (sender, e) =>
            {
                if (active == null || !ConfirmDiscard()) return;
                binding = true;
                entries.ClearSelected();
                binding = false;
                LoadDraft(null);
                title.Focus();
            };
            panel.Controls.Add(add, 0, 2);
            entries.Dock = DockStyle.Fill;
            entries.DisplayMember = "title";
            entries.BorderStyle = BorderStyle.None;
            entries.BackColor = PanelColor;
            entries.ForeColor = TextColor;
            entries.IntegralHeight = false;
            entries.AccessibleName = "Intrări";
            panel.Controls.Add(entries, 0, 3);
            return panel;
        }

        private Control BuildEditor()
        {
            var panel = new Panel { Dock = DockStyle.Fill, AutoScroll = true, Margin = new Padding(0, 0, 12, 0), BackColor = PanelColor, Padding = new Padding(16, 14, 16, 12) };
            var fields = new TableLayoutPanel { Dock = DockStyle.Top, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink, ColumnCount = 1 };
            fields.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            entryLabel.Font = new Font("Segoe UI Semibold", 15F);
            entryLabel.Height = 42;
            fields.Controls.Add(entryLabel);
            fields.Controls.Add(Field("Titlu", title));
            fields.Controls.Add(Field("Text alternativ", alt));
            fields.Controls.Add(descriptionSection);
            fields.Controls.Add(ratingSection);
            fields.Controls.Add(streamingSection);
            var image = ActionButton("Alege imaginea…");
            image.Margin = new Padding(0, 7, 0, 5);
            image.Click += PickImage;
            fields.Controls.Add(image);
            imageLabel.Dock = DockStyle.Top;
            imageLabel.Height = 25;
            imageLabel.AutoEllipsis = true;
            fields.Controls.Add(imageLabel);
            panel.Controls.Add(fields);
            return panel;
        }

        private Control BuildPreview()
        {
            var panel = Column(0, 0);
            panel.RowCount = 2;
            panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
            panel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            panel.Controls.Add(TextLabel("Previzualizare card", true), 0, 0);
            preview.Dock = DockStyle.Fill;
            preview.AllowDrop = true;
            preview.DragEnter += (sender, e) => { if (!busy && e.Data.GetDataPresent(DataFormats.FileDrop)) e.Effect = DragDropEffects.Copy; };
            preview.DragDrop += async (sender, e) =>
            {
                var files = e.Data.GetData(DataFormats.FileDrop) as string[];
                if (!busy && files != null && files.Length == 1) await LoadImage(files[0]);
            };
            panel.Controls.Add(preview, 0, 1);
            return panel;
        }

        private Control BuildFooter()
        {
            var footer = new TableLayoutPanel { Dock = DockStyle.Fill, Margin = new Padding(0, 10, 0, 0), ColumnCount = 2 };
            footer.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            footer.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            status.Dock = DockStyle.Fill;
            status.AutoEllipsis = true;
            status.TextAlign = ContentAlignment.MiddleLeft;
            footer.Controls.Add(status, 0, 0);
            var actions = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, WrapContents = false, Margin = Padding.Empty };
            var logs = ActionButton("Jurnal");
            logs.Click += (sender, e) => ShowLog();
            actions.Controls.Add(logs);
            actions.Controls.Add(openButton);
            actions.Controls.Add(stopButton);
            actions.Controls.Add(deployButton);
            actions.Controls.Add(saveButton);
            footer.Controls.Add(actions, 1, 0);
            return footer;
        }

        private static TableLayoutPanel Column(int left, int right)
        {
            var panel = new TableLayoutPanel { Dock = DockStyle.Fill, BackColor = PanelColor, ColumnCount = 1,
                Padding = new Padding(12), Margin = new Padding(left, 0, right, 0) };
            panel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            return panel;
        }

        private static Control Field(string name, Control control, bool stretch = true)
        {
            var field = new TableLayoutPanel { Dock = DockStyle.Top, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink,
                ColumnCount = 1, RowCount = 2, Margin = new Padding(0, 0, 0, 12) };
            field.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            field.Controls.Add(TextLabel(name, true), 0, 0);
            control.AccessibleName = name;
            control.Margin = new Padding(0, 4, 0, 0);
            if (stretch) control.Dock = DockStyle.Top;
            field.Controls.Add(control, 0, 1);
            return field;
        }

        private static Label TextLabel(string text, bool muted)
        {
            return new Label { Text = text, ForeColor = muted ? MutedColor : TextColor, AutoSize = false, Height = 22,
                Dock = DockStyle.Top, Margin = Padding.Empty, UseMnemonic = false };
        }

        private static Button ActionButton(string text, bool primary = false)
        {
            var button = new Button { Text = text, AutoSize = true, Height = 36, MinimumSize = new Size(78, 36),
                Padding = new Padding(9, 0, 9, 0), Margin = new Padding(5, 0, 0, 0), FlatStyle = FlatStyle.Flat,
                BackColor = primary ? AccentColor : InputColor, ForeColor = primary ? Background : TextColor, Cursor = Cursors.Hand };
            button.FlatAppearance.BorderSize = 0;
            if (primary) button.EnabledChanged += (sender, e) => button.BackColor = button.Enabled ? AccentColor : InputColor;
            return button;
        }

        private static void StyleInput(TextBox field)
        {
            field.BackColor = InputColor;
            field.ForeColor = TextColor;
            field.BorderStyle = BorderStyle.FixedSingle;
        }

        private static string FindProject(string location)
        {
            if (String.IsNullOrWhiteSpace(location) || !Directory.Exists(location)) return null;
            for (var directory = new DirectoryInfo(location); directory != null; directory = directory.Parent)
            {
                foreach (var candidate in new[] { directory.FullName, Path.Combine(directory.FullName, "tcnsite") })
                    if (File.Exists(Path.Combine(candidate, "package.json")) && File.Exists(Path.Combine(candidate, "data", "artGallery.json"))) return candidate;
            }
            return null;
        }

        private string RememberedProject()
        {
            try { return File.Exists(settingsPath) ? FindProject(File.ReadAllText(settingsPath)) : null; }
            catch (IOException) { return null; }
            catch (UnauthorizedAccessException) { return null; }
        }

        private void RememberProject()
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(settingsPath));
                File.WriteAllText(settingsPath, project);
            }
            catch (IOException) { }
            catch (UnauthorizedAccessException) { }
        }

        private async void ChooseProject(object sender, EventArgs e)
        {
            if (!ConfirmDiscard()) return;
            using (var picker = new FolderBrowserDialog { Description = "Alege folderul proiectului sau subfolderul tcnsite.", ShowNewFolderButton = false })
            {
                if (project != null) picker.SelectedPath = project;
                if (picker.ShowDialog(this) != DialogResult.OK) return;
                var folder = FindProject(picker.SelectedPath);
                if (folder == null) SetStatus("Folderul ales nu conține proiectul tcnsite.", true);
                else await LoadProject(folder);
            }
        }

        private async Task LoadProject(string folder)
        {
            SetBusy(true);
            SetStatus("Încarc colecțiile…");
            try
            {
                var result = await backend.Request(new { action = "load", project = folder }, folder);
                var sameProject = String.Equals(project, folder, StringComparison.OrdinalIgnoreCase);
                var previous = sameProject && active != null ? active.filename : null;
                if (!sameProject)
                {
                    if (!server.Stop())
                    {
                        SetStatus("Serverul local nu s-a oprit. Vezi Jurnal.", true);
                        return;
                    }
                    lastOpened = null;
                }
                project = folder;
                RememberProject();
                projectLabel.Text = folder;
                tips.SetToolTip(projectLabel, folder);
                active = result.collections.FirstOrDefault(collection => collection.filename == previous) ?? result.collections[0];
                binding = true;
                SetStreamingOptions(result.streamingServices);
                collections.DataSource = result.collections;
                collections.SelectedItem = active;
                binding = false;
                BindEntries();
                SetStatus("Alege o intrare sau adaugă una nouă.");
            }
            catch (Exception error) { ShowError(error, "Nu am putut încărca proiectul. Verifică Node.js și folderul ales."); }
            finally { SetBusy(false); }
        }

        private void CollectionsChanged(object sender, EventArgs e)
        {
            if (binding || collections.SelectedItem == null || active == collections.SelectedItem) return;
            if (!ConfirmDiscard())
            {
                binding = true;
                collections.SelectedItem = active;
                binding = false;
                return;
            }
            active = (Collection)collections.SelectedItem;
            BindEntries();
        }

        private void BindEntries(string id = null)
        {
            var items = active.items.OrderBy(item => item.title, StringComparer.CurrentCultureIgnoreCase).ToList();
            var match = id == null ? items.FirstOrDefault() : items.Find(item => item.id == id);
            binding = true;
            entries.DataSource = items;
            entries.SelectedItem = match;
            binding = false;
            LoadDraft(match);
        }

        private void EntriesChanged(object sender, EventArgs e)
        {
            if (binding || entries.SelectedItem == selected) return;
            if (!ConfirmDiscard())
            {
                binding = true;
                entries.SelectedItem = selected;
                binding = false;
                return;
            }
            LoadDraft(entries.SelectedItem as Entry);
        }

        private void LoadDraft(Entry entry)
        {
            binding = true;
            selected = entry;
            pickedImage = null;
            entryLabel.Text = entry == null ? "Intrare nouă" : "Editează intrarea";
            title.Text = entry == null ? "" : entry.title;
            alt.Text = entry == null ? "" : entry.alt;
            description.Text = entry == null ? "" : entry.description;
            rating.Value = Math.Max(0M, Math.Min(5M, entry == null ? 0 : entry.rating ?? 0));
            foreach (var box in streamingOptions.Controls.OfType<CheckBox>())
            {
                var id = (string)box.Tag;
                box.Checked = entry != null && ((entry.streamingServices ?? new string[0]).Contains(id) || (id == "netflix" && entry.netflix));
            }
            ratingSection.Visible = active.kind == "tierlist";
            descriptionSection.Visible = active.kind != "watchlist";
            streamingSection.Visible = active.kind == "watchlist";
            imageLabel.Text = entry == null || String.IsNullOrEmpty(entry.image) ? "Alege sau trage o imagine pe card." : entry.image;
            preview.ReplaceImage(null, active.aspect);
            dirty = false;
            binding = false;
            UpdateDraft();
            if (entry != null && !String.IsNullOrEmpty(entry.image))
            {
                var ignored = LoadImage(null);
            }
            else previewRequest++;
        }

        private void DraftChanged(object sender, EventArgs e)
        {
            if (binding || active == null) return;
            dirty = true;
            UpdateDraft();
        }

        private void SetStreamingOptions(IEnumerable<StreamingService> services)
        {
            streamingOptions.SuspendLayout();
            foreach (var control in streamingOptions.Controls.Cast<Control>().ToArray()) control.Dispose();
            var index = 0;
            foreach (var service in services)
            {
                var box = new CheckBox { Text = service.label, Tag = service.id, AutoSize = true, ForeColor = TextColor,
                    Margin = new Padding(0, 0, 6, 4) };
                box.CheckedChanged += DraftChanged;
                streamingOptions.Controls.Add(box, index % 2, index / 2);
                index++;
            }
            streamingOptions.ResumeLayout();
        }

        private IEnumerable<CheckBox> CheckedServices()
        {
            return streamingOptions.Controls.OfType<CheckBox>().Where(box => box.Checked);
        }

        private void UpdateDraft()
        {
            var platforms = active.kind == "watchlist" ? String.Join("  ·  ", CheckedServices().Select(box => box.Text)) : "";
            preview.UpdateCard(title.Text, active.kind, rating.Value, platforms, description.Text.Trim().Length > 0);
            saveButton.Enabled = !busy && title.Text.Trim().Length > 0 && (selected != null ? dirty : pickedImage != null);
        }

        private async void PickImage(object sender, EventArgs e)
        {
            using (var picker = new OpenFileDialog { Title = "Alege imaginea", Filter = "Imagini JPEG, PNG și WebP|*.jpg;*.jpeg;*.png;*.webp", CheckFileExists = true })
                if (picker.ShowDialog(this) == DialogResult.OK) await LoadImage(picker.FileName);
        }

        private async Task LoadImage(string source)
        {
            if (active == null) return;
            var requestNumber = ++previewRequest;
            try
            {
                var response = await backend.Request(new { action = "preview", project, active.filename,
                    id = selected == null ? null : selected.id, imagePath = source }, project);
                if (requestNumber != previewRequest || IsDisposed) return;
                if (!String.IsNullOrEmpty(response.image))
                {
                    using (var buffer = new MemoryStream(Convert.FromBase64String(response.image)))
                    using (var decoded = Image.FromStream(buffer))
                        preview.ReplaceImage(new Bitmap(decoded), active.aspect ?? new Dimensions { width = response.width, height = response.height });
                }
                if (source != null)
                {
                    pickedImage = source;
                    imageLabel.Text = Path.GetFileName(source);
                    dirty = true;
                    UpdateDraft();
                    SetStatus("Imaginea este gata pentru salvare.");
                }
            }
            catch (Exception error)
            {
                if (requestNumber == previewRequest && !IsDisposed) ShowError(error, "Nu am putut deschide imaginea.");
            }
        }

        private async void SaveEntry(object sender, EventArgs e)
        {
            if (busy || active == null) return;
            SetBusy(true);
            SetStatus("Salvez și rulez optimizarea imaginilor…");
            var sameCollection = active;
            try
            {
                var saved = await backend.Request(new { action = "save", project, active.filename, active.revision,
                    id = selected == null ? null : selected.id, title = title.Text, alt = alt.Text, description = description.Text,
                    rating = rating.Value, streamingServices = CheckedServices().Select(box => (string)box.Tag).ToArray(), imagePath = pickedImage }, project);
                lastLog = saved.log;
                active = saved.collection;
                var list = (List<Collection>)collections.DataSource;
                list[list.IndexOf(sameCollection)] = active;
                binding = true;
                collections.DataSource = null;
                collections.DataSource = list;
                collections.SelectedItem = active;
                binding = false;
                BindEntries(saved.id);
                await OpenSite(false);
            }
            catch (Exception error) { ShowError(error, "Salvarea nu s-a finalizat."); }
            finally { SetBusy(false); }
        }

        private async void DeploySite(object sender, EventArgs e)
        {
            if (busy || project == null) return;
            if (dirty && MessageBox.Show(this, "Ai modificări nesalvate. Publici versiunea salvată pe disc?", "Deploy",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) != DialogResult.Yes) return;

            SetBusy(true);
            lastLog = null;
            SetStatus("Optimizez imaginile și public pe GitHub Pages…");
            try
            {
                var published = await backend.Request(new { action = "deploy", project }, project);
                lastLog = published.log;
                SetStatus("Comanda de publicare pe GitHub Pages s-a finalizat.");
            }
            catch (Exception error) { ShowError(error, "Publicarea nu s-a finalizat."); }
            finally { SetBusy(false); }
        }

        private async Task OpenSite(bool forceBrowser)
        {
            if (project == null || active == null) return;
            var alreadyBusy = busy;
            SetBusy(true);
            SetStatus("Pornesc previzualizarea locală…");
            try
            {
                var baseUrl = await server.Start(project);
                var query = String.IsNullOrEmpty(active.discoveryId) ? "" : "?portfolio_preview=" + Uri.EscapeDataString(active.discoveryId);
                var url = baseUrl + query + (String.IsNullOrEmpty(active.route) ? "" : "#" + active.route);
                if (forceBrowser || !String.Equals(lastOpened, url, StringComparison.Ordinal))
                {
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                    lastOpened = url;
                }
                SetStatus((forceBrowser ? "Site local deschis · " : "Salvat și optimizat · ") + baseUrl);
            }
            catch (Exception error)
            {
                ShowError(error, forceBrowser ? "Previzualizarea locală nu a pornit." : "Salvat și optimizat. Previzualizarea locală nu a pornit.");
            }
            finally { SetBusy(alreadyBusy); }
        }

        private void StopSite(object sender, EventArgs e)
        {
            if (server.Stop())
            {
                lastOpened = null;
                SetStatus("Serverul local a fost oprit.");
            }
            else SetStatus("Serverul local nu s-a oprit. Vezi Jurnal.", true);
            SetBusy(false);
        }

        private void SiteExited(object sender, EventArgs e)
        {
            if (!IsHandleCreated) return;
            try
            {
                BeginInvoke(new Action(() => stopButton.Enabled = !busy && server.IsRunning));
            }
            catch (InvalidOperationException) { }
        }

        private bool ConfirmDiscard()
        {
            return !dirty || MessageBox.Show(this, "Renunți la modificările nesalvate?", "Modificări nesalvate",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.Yes;
        }

        private void ClosingEditor(object sender, FormClosingEventArgs e)
        {
            if (busy || !ConfirmDiscard()) { e.Cancel = true; return; }
            if (!server.Stop())
            {
                SetStatus("Serverul local nu s-a oprit. Vezi Jurnal.", true);
                e.Cancel = true;
            }
        }

        private void SetBusy(bool value)
        {
            busy = value;
            body.Enabled = !value && active != null;
            folderButton.Enabled = !value;
            reloadButton.Enabled = !value && project != null;
            openButton.Enabled = !value && active != null;
            stopButton.Enabled = !value && server.IsRunning;
            deployButton.Enabled = !value && project != null;
            if (active != null) UpdateDraft();
            else saveButton.Enabled = false;
        }

        private void SetStatus(string text, bool error = false)
        {
            status.Text = text;
            status.ForeColor = error ? Color.LightSalmon : MutedColor;
            tips.SetToolTip(status, text);
        }

        private void ShowError(Exception exception, string text)
        {
            lastLog = (lastLog == null ? "" : lastLog + Environment.NewLine + Environment.NewLine) + exception.Message;
            SetStatus(text + " Vezi Jurnal.", true);
        }

        private void ShowLog()
        {
            using (var dialog = new Form { Text = "Jurnal", Size = new Size(720, 390), StartPosition = FormStartPosition.CenterParent,
                ShowInTaskbar = false, BackColor = Background, ForeColor = TextColor })
            {
                var lines = new TextBox { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Both, Dock = DockStyle.Fill,
                    BackColor = PanelColor, ForeColor = TextColor, Font = new Font("Consolas", 10F),
                    Text = lastLog == null ? "Aici apar mesajele comenzilor și eventualele erori." : lastLog.Replace("\r\n", "\n").Replace("\n", Environment.NewLine) };
                if (!String.IsNullOrWhiteSpace(server.Log)) lines.AppendText(Environment.NewLine + Environment.NewLine + server.Log);
                dialog.Controls.Add(lines);
                dialog.ShowDialog(this);
            }
        }
    }

    internal sealed class CoverPreview : Control
    {
        private readonly Font titleFont = new Font("Segoe UI Semibold", 12F);
        private readonly Font detailFont = new Font("Segoe UI", 9F);
        private Image cover;
        private Dimensions dimensions;
        private string title = "";
        private string kind = "gallery";
        private decimal rating;
        private string platforms = "";
        private bool description;

        public CoverPreview() { DoubleBuffered = true; BackColor = EditorForm.Background; AccessibleName = "Previzualizare card"; }

        public void ReplaceImage(Image image, Dimensions aspect)
        {
            if (cover != null) cover.Dispose();
            cover = image;
            dimensions = aspect;
            Invalidate();
        }

        public void UpdateCard(string entryTitle, string type, decimal score, string streamingLabels, bool hasDescription)
        {
            title = String.IsNullOrWhiteSpace(entryTitle) ? "Titlul intrării" : entryTitle;
            kind = type;
            rating = score;
            platforms = streamingLabels;
            description = hasDescription;
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (Width < 50 || Height < 100) return;
            const int padding = 14;
            var gallery = kind == "gallery";
            var tierlist = kind == "tierlist";
            var platformHeight = platforms.Length > 0 ? 36 : 0;
            var aspect = dimensions != null && dimensions.height > 0 ? (double)dimensions.width / dimensions.height : 2.0 / 3.0;
            var availableHeight = Math.Max(1, Height - 98 - platformHeight);
            var pictureWidth = Math.Max(1, Math.Min(Width - 4 * padding, (int)Math.Ceiling(availableHeight * aspect)));
            var pictureHeight = Math.Max(1, Math.Min(availableHeight, (int)Math.Ceiling(pictureWidth / aspect)));
            var cardWidth = Math.Min(Width - 2 * padding, Math.Max(200, pictureWidth + 2 * padding));
            var cardHeight = pictureHeight + 72 + platformHeight;
            var left = (Width - cardWidth) / 2;
            var top = (Height - cardHeight) / 2;
            var frame = new Rectangle((Width - pictureWidth) / 2, top + (gallery ? padding : 43 + platformHeight), pictureWidth, pictureHeight);
            using (var surface = new SolidBrush(EditorForm.PanelColor)) e.Graphics.FillRectangle(surface, left, top, cardWidth, cardHeight);
            if (cover == null)
            {
                using (var fill = new SolidBrush(EditorForm.InputColor)) e.Graphics.FillRectangle(fill, frame);
                TextRenderer.DrawText(e.Graphics, "Imagine", detailFont, frame, EditorForm.MutedColor,
                    TextFormatFlags.VerticalCenter | TextFormatFlags.HorizontalCenter);
            }
            else
            {
                var scale = Math.Max((double)frame.Width / cover.Width, (double)frame.Height / cover.Height);
                var sourceWidth = (float)(frame.Width / scale);
                var sourceHeight = (float)(frame.Height / scale);
                var source = new RectangleF((cover.Width - sourceWidth) / 2, (cover.Height - sourceHeight) / 2, sourceWidth, sourceHeight);
                e.Graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                e.Graphics.DrawImage(cover, frame, source, GraphicsUnit.Pixel);
            }
            var headingY = gallery ? frame.Bottom + 8 : top + 10;
            TextRenderer.DrawText(e.Graphics, title, titleFont, new Rectangle(left + padding, headingY, cardWidth - padding * 2, 26),
                EditorForm.TextColor, TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine | TextFormatFlags.NoPrefix);
            if (platformHeight > 0)
                TextRenderer.DrawText(e.Graphics, platforms, detailFont, new Rectangle(left + padding, headingY + 27, cardWidth - padding * 2, platformHeight),
                    EditorForm.MutedColor, TextFormatFlags.WordBreak | TextFormatFlags.EndEllipsis | TextFormatFlags.NoPrefix);
            var footer = tierlist ? rating.ToString("0.##") + " / 5" : description && gallery ? "Descriere disponibilă" : "";
            TextRenderer.DrawText(e.Graphics, footer, detailFont, new Rectangle(left + padding, top + cardHeight - 24, cardWidth - padding * 2, 18),
                EditorForm.MutedColor, TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (cover != null) cover.Dispose();
                titleFont.Dispose();
                detailFont.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
