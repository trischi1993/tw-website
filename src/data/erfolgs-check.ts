export interface ErfolgsCheckArea {
  name: string;
  short: string;
  description: string;
}

export interface ErfolgsCheckOption {
  text: string;
  points: number;
}

export interface ErfolgsCheckQuestion {
  area: number;
  question: string;
  hint: string;
  options: ErfolgsCheckOption[];
}

export interface ErfolgsCheckCta {
  label: string;
  href: string;
}

export interface ErfolgsCheckRecommendation {
  primary: ErfolgsCheckCta;
  secondary: ErfolgsCheckCta;
  note: string;
}

export const ERFOLGS_CHECK_AREAS: ErfolgsCheckArea[] = [
  {
    name: 'Bereich 1: Vision & Ziele',
    short: 'Vision & Ziele',
    description: 'Dein Warum und deine Richtung',
  },
  {
    name: 'Bereich 2: Profil & Positionierung',
    short: 'Profil & Positionierung',
    description: 'Wie du nach außen wirkst',
  },
  {
    name: 'Bereich 3: Strategie & Content-Funnel',
    short: 'Strategie & Content-Funnel',
    description: 'Dein Content-System',
  },
  {
    name: 'Bereich 4: Content-Produktion',
    short: 'Content-Produktion',
    description: 'Wie du Content umsetzt',
  },
  {
    name: 'Bereich 5: Analyse & Optimierung',
    short: 'Analyse & Optimierung',
    description: 'Daten & Lernschleifen',
  },
  {
    name: 'Bereich 6: Angebote & Monetarisierung',
    short: 'Angebote & Monetarisierung',
    description: 'Reichweite zu Umsatz',
  },
];

export const ERFOLGS_CHECK_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.8"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 21v-1.7a4.2 4.2 0 0 0-4.2-4.2H8.7a4.2 4.2 0 0 0-4.2 4.2V21"/><circle cx="12" cy="7.2" r="3.8"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 17 6.1-6.1 4.6 4.6 8.3-8.3"/><path d="M16 7.2h5.5v5.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-3v10l-6-3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20v-5.5M12 20V4M18 20V9.5"/><path d="M3 20.5h18"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M14.6 8.7a2.6 2.6 0 0 0-5 1c0 1.5 1 2 2.5 2.5s2.5 1 2.5 2.5a2.6 2.6 0 0 1-5 1"/><path d="M12 5.5v2M12 16.5v2"/></svg>',
];

export const ERFOLGS_CHECK_QUESTIONS: ErfolgsCheckQuestion[] = [
  {
    area: 0,
    question:
      'Hast du eine klare Vision – ein konkretes Bild davon, wo du mit deinem Projekt oder Business in 2–5 Jahren stehen willst?',
    hint:
      'Was ist dein großes Zukunftsbild – unabhängig von Instagram? Denn wer keine klare Vision hat, dem fehlt oft die intrinsische Motivation, Instagram wirklich ernst zu nehmen und langfristig durchzuziehen.',
    options: [
      {
        text: 'Ja – meine Vision ist klar und ich kann sie jederzeit in einem Satz beschreiben.',
        points: 3,
      },
      {
        text: 'Ich habe eine grobe Vorstellung, aber sie ist noch unscharf oder nicht wirklich greifbar.',
        points: 1,
      },
      {
        text: 'Nein – ich habe mich damit noch nicht wirklich auseinandergesetzt.',
        points: 0,
      },
    ],
  },
  {
    area: 0,
    question:
      'Was erwartest du dir von Instagram – hast du klare Ziele definiert, die du damit erreichen willst?',
    hint:
      'Nicht „mehr Reichweite“ oder „mehr Follower“ – sondern konkrete, messbare Ziele. Zum Beispiel 5 neue Kundenanfragen pro Monat, 10 E-Book-Verkäufe pro Woche oder 500 neue Follower im nächsten Quartal.',
    options: [
      {
        text: 'Ich habe ein klares, messbares Ziel für die nächsten Monate – ich weiß genau, woran ich meinen Erfolg messe.',
        points: 3,
      },
      {
        text: 'Ich möchte sichtbar werden und Kunden gewinnen – aber ein konkretes, messbares Ziel habe ich nicht definiert.',
        points: 1,
      },
      {
        text: 'Ich habe ein Instagram-Profil, weil heutzutage halt jeder eins hat – eine klare Zielsetzung fehlt mir noch komplett.',
        points: 0,
      },
    ],
  },
  {
    area: 1,
    question:
      'Hast du eine klare Positionierung – weißt du, für wen du auf Instagram da bist, was du anbietest und warum ausgerechnet du?',
    hint:
      'Positionierung bedeutet: Für wen bin ich da, was biete ich – und warum ich? Wer das nicht klar hat, postet für alle und erreicht niemanden.',
    options: [
      { text: 'Ja – ich kann das sofort klar und präzise auf den Punkt bringen.', points: 3 },
      {
        text: 'Ich weiß es ungefähr, würde es aber jedes Mal etwas anders formulieren.',
        points: 1,
      },
      {
        text: 'Nein – ich tue mich ehrlich gesagt schwer, das konkret zu sagen.',
        points: 0,
      },
    ],
  },
  {
    area: 1,
    question:
      'Kennst du die konkreten Probleme und Bedürfnisse deiner Zielgruppe – weißt du, was sie wirklich antreibt oder frustriert?',
    hint:
      'Beispiel: Ein Fitnesscoach für Männer ab 40 kennt nicht nur das Alter seiner Zielgruppe, sondern auch ihre echten Frustrationen – etwa den Wunsch, wieder Energie zu haben und sich im eigenen Körper wohlzufühlen.',
    options: [
      {
        text: 'Ja – ich kenne die konkreten Probleme und Wünsche meiner Zielgruppe und spreche sie gezielt in meinem Content an.',
        points: 3,
      },
      {
        text: 'Ich habe eine grobe Ahnung, aber habe mich damit noch nicht wirklich tief auseinandergesetzt.',
        points: 1,
      },
      { text: 'Nein – ich habe mir das noch nie konkret überlegt.', points: 0 },
    ],
  },
  {
    area: 1,
    question:
      'Was steht in der ersten Zeile deiner Instagram-Bio – und spricht sie deine Zielgruppe direkt an?',
    hint: 'Öffne kurz dein Profil – das ist eine Realitätsprüfung, keine Wissensfrage.',
    options: [
      {
        text: 'Eine klare Aussage, wem ich helfe oder für wen ich da bin – zum Beispiel „Ich helfe Selbstständigen, auf Instagram sichtbar zu werden.“',
        points: 3,
      },
      {
        text: 'Meine Berufsbezeichnung oder meinen Namen – zum Beispiel „Coach“, „Fotografin“ oder „Hotel XY“.',
        points: 1,
      },
      { text: 'Irgendeinen Satz über mich – oder die Bio ist fast leer.', points: 0 },
    ],
  },
  {
    area: 1,
    question:
      'Zeigst du dich regelmäßig auf Instagram – gibt es ein menschliches Gesicht hinter deinem Account?',
    hint:
      'Accounts mit einer echten Person dahinter – jemandem, der Einblicke gibt, Geschichten erzählt und Emotionen zeigt – bauen deutlich schneller Vertrauen und eine loyale Community auf als reine Produkt- oder Themen-Accounts.',
    options: [
      {
        text: 'Ja – ich zeige mich regelmäßig und bewusst in Reels, Stories und Posts als Gesicht meines Accounts.',
        points: 3,
      },
      { text: 'Manchmal, aber nicht konsequent.', points: 1 },
      {
        text: 'Nein – ich bin kaum oder gar nicht auf meinen eigenen Inhalten sichtbar.',
        points: 0,
      },
    ],
  },
  {
    area: 2,
    question:
      'Weißt du, wie der Instagram-Algorithmus wirklich funktioniert – und wer ihn eigentlich steuert?',
    hint:
      'Die meisten machen den Algorithmus verantwortlich, wenn ihr Content nicht performt – aber der eigentliche Schlüssel liegt woanders.',
    options: [
      {
        text: 'Ja – ich kenne die wichtigsten Faktoren und richte meinen Content bewusst danach aus.',
        points: 3,
      },
      {
        text: 'Ich habe eine grobe Vorstellung, aber setze das Wissen noch nicht wirklich gezielt ein.',
        points: 1,
      },
      {
        text: 'Nein – ich poste ohne zu wissen, nach welchen Kriterien der Algorithmus Content ausspielt.',
        points: 0,
      },
    ],
  },
  {
    area: 2,
    question:
      'Hast du eine klare Content-Strategie mit definierten Kernthemen und Content-Formaten – oder postest du eher planlos drauf los?',
    hint:
      'Wer ohne Plan postet, verschenkt Potenzial und Energie – und wundert sich, warum der Account nicht wächst oder Kunden ausbleiben.',
    options: [
      {
        text: 'Ja – ich habe klare Kernthemen und Content-Formate definiert und folge meiner Strategie konsequent.',
        points: 3,
      },
      {
        text: 'Ich habe eine grobe Richtung, aber keine klare Strategie mit definierten Themen und Formaten dahinter.',
        points: 1,
      },
      {
        text: 'Ich poste planlos – mal das, mal jenes, ohne feste Themen oder Formate.',
        points: 0,
      },
    ],
  },
  {
    area: 2,
    question:
      'Setzt du in deinen Reels bewusst einen Hook – also einen starken Einstieg in den ersten 1–3 Sekunden?',
    hint:
      'Öffne deine letzten 3 Reels und schau die ersten Sekunden an. Ein Hook kann visuell sein, sprachlich oder als Text-Overlay – Ziel ist, die Zuschauer sofort zu fesseln, bevor sie weiterscrollen.',
    options: [
      {
        text: 'Ja – ich setze bewusst einen starken Hook, der sofort Neugier weckt oder eine Spannung aufbaut.',
        points: 3,
      },
      {
        text: 'Manchmal, aber nicht konsequent – ich denke nicht bei jedem Post gezielt daran.',
        points: 1,
      },
      { text: 'Nein – ich fange einfach an, ohne einen bewussten Einstieg zu setzen.', points: 0 },
    ],
  },
  {
    area: 2,
    question:
      'Wie oft postest du pro Woche auf Instagram – und hältst du diese Frequenz auch langfristig durch?',
    hint:
      'Gemeint ist ein realistischer Wochendurchschnitt – nicht die beste Woche, sondern dein normaler Alltag.',
    options: [
      { text: 'Mindestens 3–4 Mal pro Woche – konstant und verlässlich.', points: 3 },
      { text: '1–2 Mal pro Woche – eher unregelmäßig.', points: 1 },
      { text: 'Weniger als einmal pro Woche oder sehr sporadisch.', points: 0 },
    ],
  },
  {
    area: 3,
    question:
      'Wie sicher bist du in der technischen Content-Produktion mit dem Handy – Kamera, Beleuchtung und Ton?',
    hint:
      'Denk an dein letztes Reel: Wie hast du dich aufgestellt? Wie waren Bildausschnitt, Beleuchtung und Tonqualität? Die Aufnahme selbst ist die Basis – alles andere baut darauf auf.',
    options: [
      {
        text: 'Ich beherrsche das sicher – Kameraeinstellungen, Bildaufbau, Beleuchtung und Tonqualität passen, meine Aufnahmen wirken professionell.',
        points: 3,
      },
      {
        text: 'Ich filme, aber Bildqualität, Beleuchtung oder Ton sind noch nicht so, wie ich mir das vorstelle.',
        points: 1,
      },
      {
        text: 'Die technische Aufnahme ist für mich noch eine Hürde – ich weiß nicht genau, wie ich es richtig angehe.',
        points: 0,
      },
    ],
  },
  {
    area: 3,
    question:
      'Bearbeitest du deinen Content professionell – achtest du bei Schnitt, Ton und Grafik darauf, dass deine Videos hochwertig wirken?',
    hint:
      'Ein professionell bearbeitetes Reel erkennt man an sauberen Schnitten, passender Musik, lesbaren Texteinblendungen und einem klaren roten Faden – das hält Zuschauer länger und erhöht die Performance deutlich.',
    options: [
      {
        text: 'Ja – ich bearbeite meinen Content bewusst: saubere Schnitte, guter Sound, ansprechende Grafiken und Texteinblendungen gehören für mich dazu.',
        points: 3,
      },
      {
        text: 'Ich schneide meinen Content, aber bei Ton, Grafiken und Details fehlt mir noch das nötige Wissen oder die Zeit.',
        points: 1,
      },
      {
        text: 'Content-Bearbeitung ist für mich noch Neuland – ich veröffentliche oft ohne viel Nachbearbeitung.',
        points: 0,
      },
    ],
  },
  {
    area: 4,
    question:
      'Überprüfst du regelmäßig deine Insights – um deine Erfolge und Misserfolge zu analysieren?',
    hint:
      'Öffne kurz deine Insights. Kannst du von den letzten 30 Posts Muster erkennen, welche Themen und Formate gut performen und welche nicht?',
    options: [
      {
        text: 'Ja – ich behalte meine Insights regelmäßig im Blick und erkenne klare Muster, welche Themen und Formate bei meiner Zielgruppe performen und welche nicht.',
        points: 3,
      },
      {
        text: 'Ich schaue gelegentlich in meine Insights, könnte aber keine klaren Muster benennen, was wirklich gut läuft und was nicht.',
        points: 1,
      },
      { text: 'Nein – ich poste und schaue kaum oder nie in meine Insights.', points: 0 },
    ],
  },
  {
    area: 4,
    question: 'Optimierst du deine Strategie regelmäßig – auf Basis deiner letzten Analysen?',
    hint:
      'Es reicht nicht, die Zahlen zu kennen – entscheidend ist, ob du daraus die richtigen Schlüsse ziehst und deine nächsten Schritte aktiv anpasst, um kontinuierliche Fortschritte zu gewährleisten.',
    options: [
      {
        text: 'Ja – ich werte meine Insights regelmäßig aus und optimiere meine Content-Strategie aktiv auf Basis dieser Erkenntnisse.',
        points: 3,
      },
      {
        text: 'Ich mache das gelegentlich, aber nicht systematisch – ich weiß ehrlich gesagt nicht, ob meine sporadischen Optimierungen überhaupt sinnvoll sind.',
        points: 1,
      },
      {
        text: 'Nein – ich poste weiter wie bisher, ohne meine Ergebnisse gezielt zur Optimierung zu nutzen.',
        points: 0,
      },
    ],
  },
  {
    area: 4,
    question:
      'Kennst du Content-Repurposing – also die Methode, deine erfolgreichsten Postings gezielt zu skalieren und mehrfach zu nutzen?',
    hint:
      'Die meisten produzieren ständig neuen Content – dabei liegt die größte Wachstumschance oft direkt vor ihnen, nachdem gründliche Erfolgsmessungen gemacht wurden.',
    options: [
      {
        text: 'Ja – ich kenne Content-Repurposing und setze es aktiv ein, um erfolgreiche Inhalte zu skalieren.',
        points: 3,
      },
      {
        text: 'Ich habe davon gehört, weiß aber nicht genau, wie man es systematisch umsetzt.',
        points: 1,
      },
      {
        text: 'Nein – ich habe noch nie davon gehört und produziere einfach immer neuen Content.',
        points: 0,
      },
    ],
  },
  {
    area: 5,
    question:
      'Hast du ein klares Angebot – ein Produkt oder eine Dienstleistung, das konkret auf die Probleme und Bedürfnisse deiner Zielgruppe eingeht?',
    hint:
      'Nicht „ich könnte etwas anbieten“ – sondern ein klar definiertes Angebot, das du heute aktiv vermarkten könntest.',
    options: [
      {
        text: 'Ja – ich habe ein klares Angebot, das direkt auf die Probleme und Wünsche meiner Zielgruppe eingeht.',
        points: 3,
      },
      {
        text: 'Ich habe eine Idee oder ein vages Angebot, aber es ist noch nicht klar definiert oder aktiv vermarktbar.',
        points: 1,
      },
      { text: 'Nein – ich habe noch kein konkretes Angebot.', points: 0 },
    ],
  },
  {
    area: 5,
    question:
      'Hast du hinter deinen Posts ein durchdachtes System – das Zuschauer automatisch in Richtung deiner Angebote führt?',
    hint:
      'Das kann ein Kommentar-CTA mit Automation sein, ein Engagement-CTA wie „Folge mir für mehr“, eine Landingpage im Hintergrund oder E-Mail-Marketing – Hauptsache, es gibt einen klaren nächsten Schritt.',
    options: [
      {
        text: 'Ja – ich habe ein durchdachtes System hinter meinen Posts, das Zuschauer gezielt zu meinen Angeboten führt.',
        points: 3,
      },
      {
        text: 'Es gibt einen Link oder einen CTA, aber das Ganze ist nicht wirklich durchdacht oder auf Conversion ausgelegt.',
        points: 1,
      },
      {
        text: 'Nein – meine Posts stehen für sich, es gibt keinen klaren nächsten Schritt dahinter.',
        points: 0,
      },
    ],
  },
  {
    area: 5,
    question:
      'Wie viel Umsatz oder wie viele Anfragen bringt dir Instagram – und weißt du, dass da noch erheblich mehr möglich wäre?',
    hint:
      'Mit einer loyalen Community, einem klaren Content-Funnel und einem durchdachten System lässt sich auf Instagram deutlich mehr herausholen, als die meisten aktuell ausschöpfen.',
    options: [
      {
        text: 'Instagram bringt mir regelmäßig und planbar Anfragen oder Umsatz – ich habe ein verlässliches System dahinter.',
        points: 3,
      },
      {
        text: 'Ich bekomme vereinzelt Anfragen, aber kein planbares System – ich weiß, da ist erheblich mehr drin.',
        points: 1,
      },
      {
        text: 'Instagram bringt mir noch kaum Umsatz – ich spüre, dass enormes Potenzial brach liegt, mir fehlt aber der Weg dorthin.',
        points: 0,
      },
    ],
  },
];

/** Rückmeldung für die mittlere und die schwächste Antwort jeder Frage. */
export const ERFOLGS_CHECK_GAPS: Array<[null, string, string]> = [
  [
    null,
    'Deine Vision ist noch unscharf – du hast eine grobe Richtung, aber kein konkretes Bild davon, wo du in 2–5 Jahren stehen willst.',
    'Du hast noch keine Vision definiert – ohne klares Zukunftsbild fehlt oft die intrinsische Motivation, Instagram wirklich ernst zu nehmen und durchzuziehen.',
  ],
  [
    null,
    'Du willst wachsen – aber ohne messbares Ziel weißt du nicht, wann du erfolgreich bist, und kannst deine Strategie nicht gezielt steuern.',
    'Du postest ohne konkretes Ziel – das macht es fast unmöglich, Fortschritte zu erkennen oder die richtige Strategie zu wählen.',
  ],
  [
    null,
    'Deine Positionierung ist noch nicht auf den Punkt – du kannst nicht klar beantworten, für wen du da bist, was du anbietest und warum ausgerechnet du.',
    'Ohne klare Positionierung verlierst du Besucher, bevor sie auch nur einen Post gesehen haben – sie verstehen nicht sofort, wer du bist und warum sie dir folgen sollten.',
  ],
  [
    null,
    'Du weißt grob, wer deine Zielgruppe ist – aber ohne tiefes Verständnis ihrer Probleme und Wünsche sprichst du sie nicht wirklich an.',
    'Du kennst die Probleme und Bedürfnisse deiner Zielgruppe noch nicht – das führt dazu, dass dein Content an den falschen Menschen vorbeigeht.',
  ],
  [
    null,
    'Deine Bio beschreibt dich – aber sie beantwortet noch nicht die wichtigste Frage eines Erstbesuchers: Was habe ich davon, wenn ich dir folge?',
    'Deine Bio ist fast leer oder sagt nichts Relevantes – ein Erstbesucher versteht nicht, wer du bist und was er bei dir bekommt.',
  ],
  [
    null,
    'Du zeigst dich gelegentlich – aber nicht konsequent genug, um als echte Persönlichkeit wahrgenommen zu werden und Vertrauen aufzubauen.',
    'Du bist kaum sichtbar auf deinem eigenen Account – ohne ein menschliches Gesicht dahinter bleibt der Aufbau einer loyalen Community schwierig.',
  ],
  [
    null,
    'Du hast eine grobe Vorstellung, wie der Algorithmus funktioniert – aber setzt dieses Wissen noch nicht gezielt ein, um mehr Reichweite zu erzielen.',
    'Du weißt noch nicht, wie der Instagram-Algorithmus wirklich funktioniert – und verschenkst damit täglich Reichweite.',
  ],
  [
    null,
    'Du hast eine grobe Richtung – aber ohne klare Kernthemen und definierte Content-Formate postest du mehr aus dem Bauch als mit System.',
    'Du postest planlos – ohne klare Strategie verschenkst du Potenzial und Energie und wunderst dich, warum der Account nicht wächst oder Kunden ausbleiben.',
  ],
  [
    null,
    'Du setzt manchmal einen Hook – aber nicht konsequent genug. Die meisten Zuschauer entscheiden in den ersten Sekunden, ob sie weiterschauen oder weiterscrollen.',
    'Du startest deine Reels ohne bewussten Hook – damit verlierst du viele Zuschauer, bevor dein eigentlicher Content überhaupt beginnt.',
  ],
  [
    null,
    'Du postest 1–2 Mal pro Woche – das reicht oft nicht, um verlässlich Reichweite aufzubauen und genügend Daten für Analysen und Optimierungen zu sammeln.',
    'Du postest sehr selten oder unregelmäßig – damit bleibt dein Account für deine Zielgruppe kaum präsent und du verlierst wertvolle Wachstumschancen.',
  ],
  [
    null,
    'Du filmst – aber Bildqualität, Beleuchtung oder Ton entsprechen noch nicht dem Standard, der nötig ist, um professionell zu wirken und Vertrauen aufzubauen.',
    'Die technische Aufnahme ist noch eine echte Hürde für dich – schlechte Bildqualität oder schlechter Ton können dazu führen, dass selbst guter Content nicht ernst genommen wird.',
  ],
  [
    null,
    'Du bearbeitest deinen Content – aber bei Schnitt, Ton oder Grafiken fehlt noch das Know-how, um professionell wirkende Videos zu produzieren.',
    'Du veröffentlichst kaum bearbeiteten Content – fehlende Schnitte, schlechter Sound und keine Texteinblendungen lassen deinen Content unprofessionell wirken.',
  ],
  [
    null,
    'Du schaust gelegentlich in deine Insights – aber ohne klares Bild davon, welche Postings performen und welche nicht, fehlt dir die Grundlage für gezielte Verbesserungen.',
    'Du schaust kaum in deine Insights – du weißt nicht, was bei deiner Zielgruppe ankommt, und wiederholst damit unbewusst auch, was nicht funktioniert.',
  ],
  [
    null,
    'Du optimierst gelegentlich – aber ohne festen Rhythmus bleibt es Zufall, ob du die richtigen Schlüsse ziehst und deine Strategie wirklich verbesserst.',
    'Du passt deine Strategie nicht an – du postest weiter wie bisher, ohne aus deinen Ergebnissen zu lernen, was langfristig zu Stagnation führt.',
  ],
  [
    null,
    'Du hast von Content-Repurposing gehört, weißt aber noch nicht, wie man es systematisch umsetzt – und verschenkst damit wertvolles Wachstumspotenzial.',
    'Du hast noch nie von Content-Repurposing gehört – und produzierst immer neuen Content, obwohl die größte Wachstumschance oft direkt vor dir liegt.',
  ],
  [
    null,
    'Du hast eine Idee oder ein vages Angebot – aber solange es nicht klar definiert und aktiv vermarktbar ist, kann Instagram dir keine verlässlichen Ergebnisse bringen.',
    'Du hast noch kein konkretes Angebot – ohne das kannst du Reichweite aufbauen, aber nicht in Umsatz oder Anfragen verwandeln.',
  ],
  [
    null,
    'Es gibt einen Link oder CTA – aber dein System ist noch nicht durchdacht genug, um Zuschauer wirklich gezielt zu deinen Angeboten zu führen.',
    'Du hast kein System hinter deinen Posts – Besucher finden keinen klaren nächsten Schritt und gehen wieder.',
  ],
  [
    null,
    'Du bekommst vereinzelt Anfragen – aber ohne planbares System bleibt dein Umsatz über Instagram zufällig statt verlässlich.',
    'Instagram bringt dir noch kaum Umsatz – das Potenzial liegt brach, weil der Weg von Reichweite zu Anfragen und Umsatz noch nicht aufgebaut ist.',
  ],
];

export const ERFOLGS_CHECK_SPECIFIC_TITLES = [
  {
    title: 'Das Fundament fehlt noch – und das ist deine größte Chance',
    text: 'Ohne klare Vision und messbare Ziele fehlt der innere Antrieb, Instagram wirklich durchzuziehen. Wer das jetzt definiert, hat den entscheidenden Vorteil gegenüber allen, die einfach drauflosposten.',
  },
  {
    title: 'Dein Profil und deine Positionierung schöpfen noch nicht aus, was wirklich in dir steckt',
    text: 'Positionierung, Zielgruppe, Bio und Brand Face – wer hier Schwächen hat, verliert Besucher, bevor sie auch nur einen Post gesehen haben. Das ist oft der größte stille Wachstumsblocker.',
  },
  {
    title: 'Du postest – aber ohne klare Strategie verschenkst du Reichweite und Zeit',
    text: 'Algorithmus-Verständnis, Content-Strategie, starke Hooks und regelmäßiges Posten – wer diese vier Faktoren beherrscht, wächst systematisch. Fehlt auch nur einer davon, bleibt viel Potenzial auf der Strecke.',
  },
  {
    title: 'Dein Content-System steht – die Produktionsqualität hält noch nicht mit',
    text: 'Technische Aufnahme und professionelle Bearbeitung entscheiden, ob dein Content überzeugend wirkt oder im Vergleich zu anderen untergeht. Hier liegt noch ungenutztes Potenzial.',
  },
  {
    title: 'Du produzierst Content – aber lässt deine Daten noch ungenutzt',
    text: 'Insights, Optimierung und Content-Repurposing sind die drei Hebel, die aus gutem Content großen Content machen. Wer sie nicht nutzt, arbeitet hart statt smart.',
  },
  {
    title: 'Dein Account wächst – aber Instagram generiert noch keinen verlässlichen Umsatz',
    text: 'Ein klares Angebot, ein durchdachter Funnel und ein System, das Reichweite in Anfragen verwandelt – das ist der Unterschied zwischen einem schönen Account und einem, der wirklich Ergebnisse liefert.',
  },
];

export const ERFOLGS_CHECK_MULTI_TITLES = [
  {
    title: 'In mehreren Bereichen liegt noch ungenutztes Potenzial – das sind deine größten Hebel',
    text: 'Fast alle erfolgreichen Instagram-Accounts haben genau hier angefangen. Der Unterschied zwischen denen, die es schaffen, und denen, die aufgeben: ein solides Fundament aus Vision, Strategie und System. Genau das kannst du jetzt aufbauen.',
  },
  {
    title: 'Du bist aktiv – aber in mehreren Bereichen fehlt noch das System',
    text: 'Du postest, du versuchst etwas – und trotzdem wächst du nicht so, wie du es dir wünschst. Das liegt selten am Content selbst. Meistens fehlt das System dahinter.',
  },
  {
    title: 'Starke Basis – in einigen Bereichen liegt noch ungenutztes Potenzial',
    text: 'Du weißt, was du tust – aber in mehreren Bereichen gleichzeitig liegt noch Wachstumspotenzial. Wer diese gezielt angeht, skaliert deutlich schneller.',
  },
];

export const ERFOLGS_CHECK_RECOMMENDATIONS: ErfolgsCheckRecommendation[] = [
  {
    primary: {
      label: 'E-Book sichern – Die Instagram Erfolgsformel (nur 27 €)',
      href: 'https://ebook.tristanweithaler.com/',
    },
    secondary: {
      label: 'ALL-IN-ONE Coaching – das komplette Programm',
      href: '/all-in-one-coaching/',
    },
    note: 'Das E-Book ist dein idealer Einstieg: eine kompakte Schritt-für-Schritt-Anleitung als PDF, sofort umsetzbar. Das ALL-IN-ONE Coaching ist das komplette Programm – mit über 40 Videolektionen, 1:1 Begleitung und Praxis-Session.',
  },
  {
    primary: {
      label: 'ALL-IN-ONE Coaching – mit persönlicher Begleitung durchstarten',
      href: '/all-in-one-coaching/',
    },
    secondary: {
      label: 'Oder zuerst das E-Book holen – Die Instagram Erfolgsformel (27 €)',
      href: 'https://ebook.tristanweithaler.com/',
    },
    note: 'Das ALL-IN-ONE Coaching begleitet dich mit über 40 Videolektionen, 1:1 Calls und einer Praxis-Session vor Ort. Das E-Book ist eine kompakte Alternative zum Einstieg.',
  },
  {
    primary: {
      label: 'Kostenloses Erstgespräch buchen – 1:1 Coaching mit Tristan',
      href: 'https://calendly.com/tristanweithaler/30min',
    },
    secondary: {
      label: 'ALL-IN-ONE Coaching – das komplette Programm',
      href: '/all-in-one-coaching/',
    },
    note: 'Spezifische 1:1 Coachings sind ideal, wenn du bereits eine starke Basis hast und gezielt das Maximum aus deiner Social-Media-Präsenz herausholen willst. Das ALL-IN-ONE Coaching bietet dir ein strukturiertes Programm mit über 40 Videolektionen und 1:1 Begleitung.',
  },
];
