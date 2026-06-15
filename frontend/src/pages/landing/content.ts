import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Blocks,
  BookOpen,
  Calendar,
  CalendarCheck,
  Database,
  FileSearch,
  FileText,
  FileUp,
  FolderCheck,
  Gauge,
  Globe,
  HardDrive,
  Headphones,
  Inbox,
  Layers,
  ListChecks,
  Mail,
  MailCheck,
  MessagesSquare,
  NotebookText,
  Phone,
  PhoneCall,
  Receipt,
  ScanText,
  Search,
  Send,
  ShoppingCart,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Navigation — Header & Footer teilen sich die Anker                  */
/* ------------------------------------------------------------------ */

export const NAV_ITEMS = [
  { href: '#verbinden', label: 'Verbinden' },
  { href: '#wissen', label: 'Wissen' },
  { href: '#automatisierung', label: 'Automatisieren' },
  { href: '#loesung', label: 'Lösung' },
  { href: '#kontakt', label: 'Kontakt' },
] as const

/* ------------------------------------------------------------------ */
/* Hero — Informationsfragmente                                        */
/* ------------------------------------------------------------------ */

export const HERO_FRAGMENT_LABELS = [
  'E-Mail',
  'Dokument',
  'Anruf',
  'Meeting',
  'Rechnung',
  'CRM-Eintrag',
  'Aufgabe',
  'Support-Ticket',
  'Lead',
  'Termin',
  'Kundenanfrage',
  'Datei',
  'Nachricht',
  'Bestellung',
  'Bericht',
  'Angebot',
  'Notiz',
  'Vertrag',
  'Protokoll',
  'Zahlung',
  'Reklamation',
  'Lieferschein',
] as const

/* ------------------------------------------------------------------ */
/* Sektion 01 — Verbinden                                              */
/* ------------------------------------------------------------------ */

export type SystemDef = {
  id: string
  name: string
  category: string
  icon: LucideIcon
  /** Platzierung auf der Desktop-Bühne. */
  side: 'left' | 'right'
}

export const SYSTEMS: SystemDef[] = [
  { id: 'crm', name: 'CRM', category: 'Vertrieb & Kunden', icon: Users, side: 'left' },
  { id: 'email', name: 'E-Mail & Outlook', category: 'Kommunikation', icon: Mail, side: 'left' },
  { id: 'm365', name: 'Microsoft 365', category: 'Produktivität', icon: Layers, side: 'left' },
  { id: 'phone', name: 'Telefonanlage', category: 'Kommunikation', icon: Phone, side: 'left' },
  { id: 'accounting', name: 'Buchhaltung', category: 'Finanzen', icon: Receipt, side: 'left' },
  { id: 'storage', name: 'Cloud-Speicher', category: 'Dateien & Ablage', icon: HardDrive, side: 'left' },
  { id: 'erp', name: 'ERP', category: 'Warenwirtschaft & Betrieb', icon: Blocks, side: 'right' },
  { id: 'gworkspace', name: 'Google Workspace', category: 'Produktivität', icon: Globe, side: 'right' },
  { id: 'support', name: 'Support-Desk', category: 'Kundenservice', icon: Headphones, side: 'right' },
  { id: 'shop', name: 'Shop-System', category: 'E-Commerce', icon: ShoppingCart, side: 'right' },
  { id: 'database', name: 'Datenbanken', category: 'Interne Daten', icon: Database, side: 'right' },
  { id: 'calendar', name: 'Kalender', category: 'Termine', icon: Calendar, side: 'right' },
]

/** Weitere Anbindungen — als kompakte Chips unter der Bühne. */
export const EXTRA_SYSTEMS = [
  'Wissensdatenbanken',
  'Kundenportale',
  'Dokumentenablagen',
  'Individuelle Systeme per API',
] as const

/* ------------------------------------------------------------------ */
/* Sektion 02 — Verstehen                                              */
/* ------------------------------------------------------------------ */

export type CapabilityDef = {
  icon: LucideIcon
  title: string
  text: string
}

export const CAPABILITIES: CapabilityDef[] = [
  {
    icon: Search,
    title: 'Wissen sofort auffindbar',
    text: 'Eine Frage genügt — die Antwort kommt aus allen verbundenen Systemen.',
  },
  {
    icon: Users,
    title: 'Kundenhistorie auf einen Blick',
    text: 'Jede E-Mail, jeder Anruf, jeder Auftrag — chronologisch an einem Ort.',
  },
  {
    icon: ScanText,
    title: 'Dokumente automatisch verstanden',
    text: 'Verträge, Rechnungen und Berichte werden gelesen, nicht nur gespeichert.',
  },
  {
    icon: MessagesSquare,
    title: 'Gespräche kategorisiert',
    text: 'Anrufe und E-Mails werden Anliegen, Kunden und Vorgängen zugeordnet.',
  },
  {
    icon: Bell,
    title: 'Wichtiges proaktiv sichtbar',
    text: 'Offene Punkte werden gemeldet, bevor sie im Tagesgeschäft untergehen.',
  },
]

export type KnowledgeSource = {
  icon: LucideIcon
  label: string
}

export type KnowledgeDemo = {
  id: string
  /** Kurzes Label für die Auswahl-Chips. */
  topic: string
  question: string
  answer: string
  sources: KnowledgeSource[]
}

export const KNOWLEDGE_DEMOS: KnowledgeDemo[] = [
  {
    id: 'history',
    topic: 'Kundenhistorie',
    question: 'Was wurde mit der Brandt GmbH zuletzt besprochen?',
    answer:
      'Telefonat am Dienstag: Angebot A-2026-118 wurde angenommen. Lieferung in KW 26 bestätigt, Folgetermin am 3. Juli vereinbart.',
    sources: [
      { icon: Phone, label: 'Anruf-Transkript' },
      { icon: Users, label: 'CRM' },
      { icon: Mail, label: 'E-Mail' },
    ],
  },
  {
    id: 'sales',
    topic: 'Vertrieb',
    question: 'Welche Angebote warten seit über 14 Tagen auf Antwort?',
    answer:
      'Drei Angebote sind offen: Müller GmbH (18 Tage), Schäfer & Co. (16 Tage), Nordbau AG (15 Tage). Nachfass-Entwürfe liegen bereit.',
    sources: [
      { icon: Users, label: 'CRM' },
      { icon: Mail, label: 'E-Mail' },
      { icon: FileText, label: 'Angebote' },
    ],
  },
  {
    id: 'policy',
    topic: 'Richtlinien',
    question: 'Wie ist unsere Rabattregelung für Bestandskunden?',
    answer:
      'Ab dem zweiten Auftragsjahr 5 %, ab 25.000 € Jahresvolumen 8 %. Ausnahmen genehmigt die Vertriebsleitung — zuletzt aktualisiert im März.',
    sources: [
      { icon: BookOpen, label: 'Wissensdatenbank' },
      { icon: FileText, label: 'Vertriebshandbuch' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Sektion 03 — Automatisieren                                         */
/* ------------------------------------------------------------------ */

export type WorkflowStep = {
  icon: LucideIcon
  title: string
  /** Konkretes Ergebnis des Schritts — erscheint nach Abschluss. */
  result: string
}

export type WorkflowDef = {
  id: string
  icon: LucideIcon
  name: string
  tagline: string
  trigger: {
    icon: LucideIcon
    kind: string
    title: string
    meta: string
  }
  steps: WorkflowStep[]
  summary: string
}

export const WORKFLOWS: WorkflowDef[] = [
  {
    id: 'email',
    icon: Inbox,
    name: 'Eingehende E-Mail',
    tagline: 'Vom Posteingang bis zur erledigten Aufgabe',
    trigger: {
      icon: Mail,
      kind: 'Eingehende E-Mail',
      title: 'Lieferstatus zu Bestellung #4127?',
      meta: 'k.weber@brandt-gmbh.de · heute, 09:12',
    },
    steps: [
      { icon: ScanText, title: 'Anliegen verstanden', result: 'Thema: Lieferstatus · Priorität: hoch' },
      { icon: Users, title: 'CRM aktualisiert', result: 'Vorgang bei Brandt GmbH ergänzt' },
      { icon: ListChecks, title: 'Aufgabe erstellt', result: '„Status prüfen" an Team Logistik' },
      { icon: Bell, title: 'Team informiert', result: 'Hinweis im Team-Kanal gepostet' },
    ],
    summary: 'Beantwortet, dokumentiert, delegiert — ohne einen manuellen Schritt.',
  },
  {
    id: 'lead',
    icon: Target,
    name: 'Neuer Lead',
    tagline: 'Von der Anfrage zum qualifizierten Deal',
    trigger: {
      icon: UserCheck,
      kind: 'Neuer Lead',
      title: 'Anfrage über Website-Formular',
      meta: 'Maschinenbau · 80 Mitarbeiter · Region Süd',
    },
    steps: [
      { icon: Search, title: 'Qualifizierung', result: 'Bedarf & Budget aus Anfrage erkannt' },
      { icon: Gauge, title: 'Scoring', result: 'Lead-Score: 82 / 100 — heiß' },
      { icon: Users, title: 'CRM-Eintrag', result: 'Pipeline-Stufe: Qualifiziert' },
      { icon: Send, title: 'Vertrieb zugewiesen', result: 'Übergabe an T. Maier inkl. Dossier' },
    ],
    summary: 'Kein Lead bleibt liegen — der Vertrieb startet mit fertiger Vorarbeit.',
  },
  {
    id: 'document',
    icon: FileUp,
    name: 'Dokument-Upload',
    tagline: 'Vom PDF zur gebuchten Information',
    trigger: {
      icon: FileText,
      kind: 'Dokument-Upload',
      title: 'eingangsrechnung_meier_118.pdf',
      meta: '2 Seiten · hochgeladen um 11:47',
    },
    steps: [
      { icon: ScanText, title: 'Extraktion', result: '4.860,00 € · fällig 30.06. · Meier KG' },
      { icon: FileSearch, title: 'Klassifizierung', result: 'Typ: Eingangsrechnung' },
      { icon: FolderCheck, title: 'Ablage', result: 'Buchhaltung / 2026 / Juni' },
      { icon: NotebookText, title: 'Zusammenfassung', result: 'Kurzfassung an die Buchhaltung' },
    ],
    summary: 'Jedes Dokument landet gelesen, sortiert und zusammengefasst am richtigen Ort.',
  },
  {
    id: 'call',
    icon: PhoneCall,
    name: 'Eingehender Anruf',
    tagline: 'Vom Klingeln zum bestätigten Termin',
    trigger: {
      icon: Phone,
      kind: 'Eingehender Anruf',
      title: 'Rückruf wegen Servicetermin',
      meta: '+49 89 — angenommen · 2:14 Min.',
    },
    steps: [
      { icon: MessagesSquare, title: 'KI-Verarbeitung', result: 'Anliegen: Wartungstermin Anlage 3' },
      { icon: CalendarCheck, title: 'Termin erstellt', result: 'Donnerstag, 14:30 — Techniker Ost' },
      { icon: Users, title: 'CRM aktualisiert', result: 'Gesprächsnotiz am Kundeneintrag' },
      { icon: MailCheck, title: 'Bestätigung gesendet', result: 'Terminbestätigung per E-Mail' },
    ],
    summary: 'Auch wenn niemand abnimmt: Der Anruf wird zum erledigten Vorgang.',
  },
]

/* ------------------------------------------------------------------ */
/* Sektion 04 — Lösungs-Baukasten                                      */
/* ------------------------------------------------------------------ */

export type ChallengeDef = {
  id: string
  icon: LucideIcon
  title: string
  /** Was die Plattform in diesem Bereich übernimmt. */
  outcomes: [string, string]
  /** IDs aus SYSTEMS, die dieser Baustein verbindet. */
  systems: string[]
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'email-management',
    icon: Inbox,
    title: 'E-Mail-Management',
    outcomes: [
      'Eingehende E-Mails verstehen, priorisieren und vorbeantworten',
      'Vorgänge automatisch im CRM dokumentieren',
    ],
    systems: ['email', 'crm'],
  },
  {
    id: 'lead-qualification',
    icon: Target,
    title: 'Lead-Qualifizierung',
    outcomes: [
      'Anfragen bewerten und scoren, bevor sie jemand öffnet',
      'Übergabe an die richtige Person im Vertrieb',
    ],
    systems: ['crm', 'email'],
  },
  {
    id: 'customer-support',
    icon: Headphones,
    title: 'Kundensupport',
    outcomes: [
      'Tickets kategorisieren und mit Lösungsvorschlägen versehen',
      'Antwortentwürfe aus dem eigenen Unternehmenswissen',
    ],
    systems: ['support', 'email'],
  },
  {
    id: 'knowledge-search',
    icon: Search,
    title: 'Wissenssuche',
    outcomes: [
      'Eine Suche über alle Systeme, Ablagen und Postfächer',
      'Antworten mit Quellenangabe statt Ordner-Odyssee',
    ],
    systems: ['storage', 'database'],
  },
  {
    id: 'document-processing',
    icon: FileSearch,
    title: 'Dokumentenverarbeitung',
    outcomes: [
      'Belege auslesen, klassifizieren und korrekt ablegen',
      'Daten direkt in ERP und Buchhaltung übertragen',
    ],
    systems: ['accounting', 'erp', 'storage'],
  },
  {
    id: 'phone-automation',
    icon: PhoneCall,
    title: 'Telefon-Automatisierung',
    outcomes: [
      'Anrufe annehmen, verstehen und dokumentieren',
      'Termine direkt im Kalender buchen und bestätigen',
    ],
    systems: ['phone', 'calendar'],
  },
  {
    id: 'sales-workflows',
    icon: TrendingUp,
    title: 'Vertriebs-Workflows',
    outcomes: [
      'Angebote automatisch nachfassen, Pipeline aktuell halten',
      'Auftragsdaten zwischen CRM und ERP synchronisieren',
    ],
    systems: ['crm', 'erp'],
  },
  {
    id: 'internal-processes',
    icon: Workflow,
    title: 'Interne Prozesse',
    outcomes: [
      'Wiederkehrende Abläufe von Freigabe bis Ablage automatisieren',
      'Übergaben zwischen Abteilungen ohne Reibungsverluste',
    ],
    systems: ['m365', 'database'],
  },
]

/* ------------------------------------------------------------------ */
/* Sektion 05 — Ergebnis                                               */
/* ------------------------------------------------------------------ */

export const BEFORE_ITEMS = [
  'Getrennte Tools',
  'Manuelle Prozesse',
  'Verlorene Informationen',
  'Wiederholte Aufgaben',
  'Langsame Antworten',
  'Operative Engpässe',
] as const

export const AFTER_ITEMS = [
  'Verbundene Systeme',
  'Verfügbares Wissen',
  'Automatisierte Workflows',
  'Schnellere Entscheidungen',
  'Höhere Produktivität',
  'Skalierbarer Betrieb',
] as const
