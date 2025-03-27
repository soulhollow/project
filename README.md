# FreelanceLocal

Eine Plattform zur Verbindung von lokalen Freelancern und Kunden. Diese Anwendung ermöglicht es Freelancern, ihre Dienstleistungen zu präsentieren, und Kunden, lokale Talente zu entdecken und mit ihnen in Kontakt zu treten.

## Funktionen

- Benutzerauthentifizierung mit Supabase
- Freelancer- und Kundenprofile
- Dienstleistungsangebote und -verwaltung
- Nachrichtensystem zwischen Benutzern
- Standortbasierte Freelancer-Suche
- Favoritensystem
- Bewertungs- und Rezensionssystem

## Technologie-Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentifizierung, Datenbank, Speicher)
- React Router für die Navigation
- Lucide React für Icons
- Date-fns für Datumsformatierung

## Voraussetzungen

- Node.js (v18 oder höher empfohlen)
- npm oder yarn
- Ein Supabase-Konto und -Projekt

## Einrichtung und Installation

1. **Repository klonen**

```bash
git clone <repository-url>
cd freelancer-portal
```

2. **Abhängigkeiten installieren**

```bash
npm install
```

3. **Umgebungskonfiguration**

Erstelle eine `.env`-Datei im Hauptverzeichnis mit den folgenden Variablen:

```
VITE_SUPABASE_URL=deine_supabase_url
VITE_SUPABASE_ANON_KEY=dein_supabase_anon_key
```

Ersetze `deine_supabase_url` und `dein_supabase_anon_key` mit deinen tatsächlichen Supabase-Projekt-Anmeldedaten.

4. **Entwicklungsserver starten**

```bash
npm run dev
```

Dies startet den Vite-Entwicklungsserver, typischerweise unter http://localhost:5173.

5. **Für die Produktion bauen**

```bash
npm run build
```

6. **Produktions-Build anzeigen**

```bash
npm run preview
```

## Datenbank-Einrichtung

Die Anwendung benötigt die folgenden Tabellen in deinem Supabase-Projekt:

- `profiles`: Benutzerprofile mit Freelancer-/Kundeninformationen
- `services`: Von Freelancern angebotene Dienstleistungen
- `messages`: Chat-Nachrichten zwischen Benutzern
- `favorites`: Lieblings-Freelancer der Benutzer
- `ratings`: Bewertungen und Rezensionen für Freelancer

Weitere Details findest du im Abschnitt zum Datenbankschema.

## Datenbankschema

### Tabelle "profiles"

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  bio text,
  is_freelancer boolean default false,
  availability boolean default true,
  city text,
  location geography(point),
  interests text[] default '{}',
  rating float default 0,
  agb_accepted boolean default false,
  created_at timestamp with time zone default now()
);
```

### Tabelle "services"

```sql
create table services (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles on delete cascade not null,
  title text not null,
  description text,
  rate numeric not null,
  created_at timestamp with time zone default now()
);
```

### Tabelle "messages"

```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles on delete cascade not null,
  receiver_id uuid references profiles on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);
```

### Tabelle "favorites"

```sql
create table favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles on delete cascade not null,
  freelancer_id uuid references profiles on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, freelancer_id)
);
```

### Tabelle "ratings"

```sql
create table ratings (
  id uuid default uuid_generate_v4() primary key,
  rater_id uuid references profiles on delete cascade not null,
  freelancer_id uuid references profiles on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(rater_id, freelancer_id)
);
```

### Hilfsfunktionen

Erstelle die folgenden Funktionen im Supabase SQL-Editor:

```sql
-- Funktion zur Berechnung der Entfernung zwischen Profilen
create or replace function calculate_distance(from_point geography(point), to_point geography(point))
returns float as $$
begin
  return ST_Distance(from_point, to_point) / 1000; -- Rückgabe in Kilometern
end;
$$ language plpgsql;

-- Funktion zur Aktualisierung des Profilstandorts
create or replace function update_profile_location(profile_id uuid, lat float, lon float)
returns void as $$
begin
  update profiles
  set location = ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  where id = profile_id;
end;
$$ language plpgsql;

-- Funktion zur Überprüfung, ob ein Benutzer einen Freelancer bewerten kann
create or replace function can_rate_freelancer(freelancer_id uuid)
returns boolean as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  -- Prüfen, ob der Benutzer versucht, sich selbst zu bewerten
  if current_user_id = freelancer_id then
    return false;
  end if;
  
  -- Prüfen, ob der Benutzer diesen Freelancer bereits bewertet hat
  if exists (
    select 1 from ratings
    where rater_id = current_user_id
    and freelancer_id = can_rate_freelancer.freelancer_id
  ) then
    return false;
  end if;
  
  return true;
end;
$$ language plpgsql security definer;
```

## RLS-Richtlinien

Implementiere Row Level Security (RLS)-Richtlinien für deine Tabellen. Hier ist ein Beispiel für die profiles-Tabelle:

```sql
-- RLS aktivieren
alter table profiles enable row level security;

-- Richtlinie für profiles erstellen
create policy "Benutzer können alle Profile ansehen"
  on profiles for select
  using (true);

create policy "Benutzer können ihr eigenes Profil aktualisieren"
  on profiles for update
  using (auth.uid() = id);
```

## Auth-Einrichtung

1. Aktiviere die E-Mail/Passwort-Registrierung in den Supabase-Authentifizierungseinstellungen
2. Konfiguriere E-Mail-Vorlagen für Verifizierung, Passwort-Zurücksetzung usw.
3. Füge die notwendigen URLs zu den Einstellungen "Site URL" und "Redirect URLs" hinzu

## Uniprojekt

Dieses Projekt wurde im Rahmen eines Projektes (Verteilte Systeme) für die Uni erstellt. 
