# Portfolio Editor

Deschide `bin/PortfolioEditor.exe`. Poți folosi calea executabilului ca țintă pentru un shortcut în Start Menu. Editorul detectează proiectul dacă executabilul se află în repo. Poți alege și manual folderul repo-ului sau `tcnsite`.

În lista din stânga alegi colecția și intrarea ori apeși **Intrare nouă**. Selectezi sau tragi un JPEG, PNG ori WebP pe previzualizarea cardului. În watchlist-uri poți bifa oricâte servicii de streaming se aplică. Cardul afișează modificările imediat.

**Salvează** scrie în fișierele locale, rulează `npm run optimize:images`, apoi pornește `npm run dev` și deschide colecția în browser. **Deschide site-ul** pornește aceeași previzualizare cu datele deja salvate. **Închide site-ul** oprește serverul local pornit de editor. La înlocuirea unui poster se păstrează fișierul original.

**Deploy** rulează `npm run optimize:images`, apoi `npm run deploy` pentru versiunea salvată pe disc. Publicarea folosește configurarea GitHub Pages și accesul Git al calculatorului. **Jurnal** arată mesajele și eventualele erori ale ultimei operații, plus mesajele serverului Vite din sesiunea curentă.

Ai nevoie de Node.js și npm în PATH și de dependențele instalate în `tcnsite` (`npm ci` la prima configurare). Pentru recompilare din rădăcina repo-ului, rulează `powershell -ExecutionPolicy Bypass -File .\tools\portfolio_editor\build.ps1`. Scriptul folosește compilatorul .NET Framework din Windows și include codul backend în executabil.
