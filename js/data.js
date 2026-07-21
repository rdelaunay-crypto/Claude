/**
 * Référentiel des données du prototype "Tutos Numériques" :
 * - 20 familles d'outils numériques métiers x 10 modules = 200 outils
 * - utilisateurs de démonstration (simulent une connexion SSO/LDAP)
 * - quelques tutoriels vidéo pré-chargés pour illustrer le fonctionnement
 *
 * Aucune dépendance externe : tout est embarqué pour fonctionner sur un
 * intranet sans accès Internet (hormis les vidéos de démonstration, qui
 * utilisent des fichiers d'exemple publics — à remplacer par les vidéos
 * réelles hébergées sur le serveur média de l'hôpital).
 */

const CATEGORY_DEFS = [
  {
    key: 'dpi', name: 'Dossier Patient Informatisé', suite: 'MediDossier', icon: '🗂️',
    desc: m => `Module « ${m} » de la suite MediDossier, le dossier patient informatisé utilisé pour la prise en charge clinique.`,
    modules: ['Accueil & Admission', 'Urgences', 'Consultation', 'Hospitalisation', 'Maternité', 'Pédiatrie', 'Gériatrie', 'Psychiatrie', 'Soins palliatifs', 'Interopérabilité DMP']
  },
  {
    key: 'pharma', name: 'Prescription & Pharmacie', suite: 'PharmaFlux', icon: '💊',
    desc: m => `Module « ${m} » de PharmaFlux, dédié à la prescription connectée et à la gestion pharmaceutique.`,
    modules: ['Prescription connectée', 'Dispensation nominative', 'Chimiothérapie', 'Stérilisation', 'Pharmacie clinique', 'Rétrocession', 'Gaz médicaux', 'Dispositifs médicaux', 'Antibiothérapie', 'Approvisionnement']
  },
  {
    key: 'imagerie', name: 'Imagerie médicale (RIS/PACS)', suite: 'RadioView', icon: '🩻',
    desc: m => `Module « ${m} » de RadioView, la plateforme d'imagerie médicale (RIS/PACS).`,
    modules: ['PACS Radiologie', 'RIS Rendez-vous', 'Échographie', 'Viewer Scanner/IRM', 'Mammographie', 'Médecine nucléaire', 'Planning radiothérapie', 'Téléradiologie', 'Archivage DICOM', 'Comptes-rendus vocaux']
  },
  {
    key: 'labo', name: 'Biologie médicale (LIMS)', suite: 'BioLab', icon: '🧪',
    desc: m => `Module « ${m} » de BioLab, le système de gestion du laboratoire de biologie médicale.`,
    modules: ['Hématologie', 'Biochimie', 'Microbiologie', 'Anatomopathologie', 'Sérothèque', 'Transfusion sanguine', 'Génétique moléculaire', 'Automates connectés', 'Qualité biologique', 'Résultats en ligne']
  },
  {
    key: 'bloc', name: 'Bloc opératoire & Anesthésie', suite: 'OpTrack', icon: '🩺',
    desc: m => `Module « ${m} » d'OpTrack, dédié au pilotage du bloc opératoire et de l'anesthésie.`,
    modules: ['Programmation opératoire', 'Anesthésie peropératoire', 'Traçabilité instruments', 'Consommables bloc', "Check-list sécurité", 'Réveil/SSPI', 'Stérilisation centrale', 'Traçabilité implants', 'Statistiques bloc', 'Planning chirurgiens']
  },
  {
    key: 'urgences', name: 'Urgences', suite: 'UrgencePlus', icon: '🚑',
    desc: m => `Module « ${m} » d'UrgencePlus, utilisé au service des urgences.`,
    modules: ['Accueil & régulation', 'Tri IOA', 'Circuit court', 'Interface SAMU-Centre 15', 'Brancardage', "Lits d'aval", 'Indicateurs urgences', 'Interface RESUVal', 'Traçabilité médicaments', 'Sortie & orientation']
  },
  {
    key: 'soins', name: 'Soins infirmiers & Planification', suite: 'SoinPlanning', icon: '🩹',
    desc: m => `Module « ${m} » de SoinPlanning, pour l'organisation des soins infirmiers.`,
    modules: ['Plan de soins guidé', 'Transmissions ciblées', 'Planification des tournées', 'Gestion des lits', 'Escarres & chutes', 'Douleur & évaluation', 'Diététique', 'Plannings soignants', 'Remplacement & intérim', 'Indicateurs qualité de soins']
  },
  {
    key: 'specialites', name: 'Spécialités médicales', suite: 'SpéCare', icon: '❤️',
    desc: m => `Module « ${m} » de SpéCare, dédié au suivi d'une spécialité médicale.`,
    modules: ['Cardiologie interventionnelle', 'Oncologie & RCP', 'Dialyse', 'Diabétologie', 'Pneumologie', 'Endoscopie digestive', 'Cardio-imagerie', 'Suivi de grossesse', 'Néonatologie', 'Rééducation fonctionnelle']
  },
  {
    key: 'rh', name: 'Ressources Humaines & Paie', suite: 'RHConnect', icon: '🧑‍💼',
    desc: m => `Module « ${m} » de RHConnect, le système RH et paie de l'établissement.`,
    modules: ['Gestion des temps', 'Paie', 'Recrutement', 'Formation continue', 'Dossier agent', 'Absences & congés', 'Entretiens annuels', 'Gestion des compétences', 'Intérim médical', 'Médecine du travail']
  },
  {
    key: 'finance', name: 'Finances & Comptabilité', suite: 'FinancePro', icon: '💶',
    desc: m => `Module « ${m} » de FinancePro, pour la gestion financière et comptable.`,
    modules: ['Comptabilité générale', 'Budget', 'Trésorerie', 'Immobilisations', 'Facturation patient', 'Analyse financière', 'Contrôle de gestion', 'Reporting financier', 'Titres de recette', 'Audit interne']
  },
  {
    key: 'achats', name: 'Achats & Logistique', suite: 'LogiFlux', icon: '📦',
    desc: m => `Module « ${m} » de LogiFlux, dédié aux achats et à la logistique.`,
    modules: ['Commandes fournisseurs', 'Marchés publics', 'Magasin central', 'Gestion des stocks', 'Transport interne', 'Blanchisserie', 'Déchets & DASRI', 'Inventaire', 'Traçabilité produits de santé', 'Référencement fournisseurs']
  },
  {
    key: 'qualite', name: 'Gestion Documentaire & Qualité', suite: 'QualiDoc', icon: '📋',
    desc: m => `Module « ${m} » de QualiDoc, pour la gestion documentaire et la qualité.`,
    modules: ['GED institutionnelle', 'Risques a priori', 'Événements indésirables', 'Certification HAS', 'Procédures & protocoles', 'Audit qualité', 'Enquêtes de satisfaction', 'Indicateurs IQSS', "Plans d'actions", 'Veille réglementaire']
  },
  {
    key: 'bureautique', name: 'Bureautique & Collaboration', suite: 'ColabSuite', icon: '💻',
    desc: m => `Module « ${m} » de ColabSuite, les outils bureautiques et collaboratifs transverses.`,
    modules: ['Messagerie interne', 'Visioconférence', 'Agenda partagé', 'Espace documentaire collaboratif', 'Annuaire interne', "Réseau social d'entreprise", 'Signature électronique', 'Enquêtes internes', 'Newsletter intranet', 'Gestion de projet']
  },
  {
    key: 'securite', name: 'Sécurité informatique & Identité', suite: 'SecuID', icon: '🔒',
    desc: m => `Module « ${m} » de SecuID, dédié à la sécurité informatique et à la gestion des identités.`,
    modules: ['Authentification unique (SSO)', 'Gestion des habilitations', 'Carte de professionnel de santé', 'Antivirus & poste de travail', 'VPN & accès distant', 'Journalisation des accès', 'Sauvegarde & PRA', 'Chiffrement des données', 'Portail mots de passe', 'Sensibilisation cybersécurité']
  },
  {
    key: 'biomedical', name: 'Biomédical & Maintenance', suite: 'TechBio', icon: '🔧',
    desc: m => `Module « ${m} » de TechBio, pour la gestion du parc biomédical et la maintenance.`,
    modules: ['Inventaire équipements', 'Maintenance préventive', 'GMAO pannes', 'Traçabilité stérilisation', 'Contrôles qualité dispositifs', 'Contrats fournisseurs', 'Radioprotection', 'Métrologie', 'Pièces détachées', 'Formation aux équipements']
  },
  {
    key: 'restauration', name: 'Restauration & Hôtellerie', suite: 'HôtelCare', icon: '🍽️',
    desc: m => `Module « ${m} » de HôtelCare, dédié à la restauration et aux services hôteliers.`,
    modules: ['Commandes repas patients', 'Régimes & allergies', 'Production culinaire', 'Gestion des menus', 'Hôtellerie chambres', 'Ménage & bio-nettoyage', 'Linge patient', 'Accueil & signalétique', 'Satisfaction hôtelière', 'Stocks alimentaires']
  },
  {
    key: 'vigilance', name: 'Vigilances & Gestion des risques', suite: 'VigilRisk', icon: '⚠️',
    desc: m => `Module « ${m} » de VigilRisk, pour la déclaration et le suivi des vigilances sanitaires.`,
    modules: ['Pharmacovigilance', 'Matériovigilance', 'Infectiovigilance', 'Identitovigilance', 'Hémovigilance', 'Réactovigilance', 'Radiovigilance', 'Événements indésirables graves', 'Cellule de crise', "Retour d'expérience"]
  },
  {
    key: 'recherche', name: 'Recherche clinique & Data', suite: 'ClinResearch', icon: '🔬',
    desc: m => `Module « ${m} » de ClinResearch, dédié à la recherche clinique et à la valorisation des données.`,
    modules: ['Gestion des protocoles', 'Consentement patient', 'eCRF essais cliniques', 'Entrepôt de données de santé', 'Biobanque', 'Publications & valorisation', 'Data management', 'Randomisation', 'Suivi des inclusions', 'Conformité RGPD recherche']
  },
  {
    key: 'pilotage', name: 'Pilotage & Statistiques (PMSI)', suite: 'PiloStat', icon: '📊',
    desc: m => `Module « ${m} » de PiloStat, utilisé pour le codage et le pilotage de l'activité.`,
    modules: ['Codage PMSI MCO', 'Codage SSR', 'Codage HAD', 'Groupage & valorisation T2A', 'Datamart décisionnel', 'Tableaux de bord direction', 'Requêteur statistique', 'Contrôle qualité du codage', 'Benchmark inter-établissements', "Prévisions d'activité"]
  },
  {
    key: 'formation', name: 'Formation & E-learning', suite: 'LearnConnect', icon: '🎓',
    desc: m => `Module « ${m} » de LearnConnect, la plateforme de formation continue de l'établissement.`,
    modules: ['Catalogue de formations', 'LMS e-learning', 'Simulation en santé', 'Gestes et soins d\'urgence (AFGSU)', 'Habilitations électriques', 'Formation incendie', 'Onboarding nouveaux arrivants', 'Évaluation des compétences', 'Webinaires métiers', 'Tutoriels outils numériques']
  }
];

function generateTools() {
  const tools = [];
  CATEGORY_DEFS.forEach(cat => {
    cat.modules.forEach((mod, i) => {
      tools.push({
        id: `${cat.key}-${i + 1}`,
        name: `${cat.suite} — ${mod}`,
        module: mod,
        suite: cat.suite,
        category: cat.name,
        categoryKey: cat.key,
        icon: cat.icon,
        description: cat.desc(mod)
      });
    });
  });
  return tools;
}

const TOOLS = generateTools();

const DEMO_USERS = [
  { id: 'u1', name: 'Camille Laurent', role: 'admin', department: 'DSI — Direction des Systèmes d\'Information', initials: 'CL' },
  { id: 'u2', name: 'Marc Dubois', role: 'contributeur', department: 'Service de Cardiologie', initials: 'MD' },
  { id: 'u3', name: 'Sophie Nguyen', role: 'contributeur', department: 'Pharmacie à Usage Intérieur', initials: 'SN' },
  { id: 'u4', name: 'Julie Bernard', role: 'lecteur', department: 'Service des Urgences', initials: 'JB' },
  { id: 'u5', name: 'Ahmed El Fassi', role: 'lecteur', department: 'Direction des Soins', initials: 'AF' }
];

// Les tutoriels de démonstration référencent la vidéo embarquée (js/demo-video.js)
// via l'identifiant spécial 'demo', résolu par le lecteur. Cela permet au
// prototype de fonctionner entièrement hors-ligne, sans serveur média.
// En production : URLs du serveur média interne de l'hôpital.
const SAMPLE_VIDEOS = ['demo', 'demo', 'demo', 'demo', 'demo'];

function seedTutorials() {
  const picks = [
    ['dpi-1', 'Prise en charge d\'un patient aux admissions', 'u1', 0],
    ['dpi-3', 'Saisir une consultation dans MediDossier', 'u2', 1],
    ['pharma-1', 'Faire une prescription connectée sans erreur', 'u3', 2],
    ['pharma-3', 'Circuit de la chimiothérapie dans PharmaFlux', 'u3', 3],
    ['imagerie-1', 'Consulter un examen sur le PACS RadioView', 'u1', 4],
    ['urgences-2', 'Utiliser le tri IOA aux urgences', 'u4', 0],
    ['bureautique-2', 'Bien démarrer une visioconférence ColabSuite', 'u1', 1],
    ['qualite-3', 'Déclarer un événement indésirable', 'u2', 2],
    ['rh-1', 'Déclarer ses heures dans RHConnect', 'u1', 3],
    ['formation-2', 'Prendre en main la plateforme LearnConnect', 'u1', 4]
  ];
  const now = Date.now();
  return picks.map((p, idx) => ({
    id: `seed-${idx + 1}`,
    toolId: p[0],
    title: p[1],
    description: `Tutoriel vidéo pas à pas : ${p[1].toLowerCase()}. Durée courte, pensé pour une prise en main rapide sur le terrain.`,
    videoUrl: SAMPLE_VIDEOS[p[3]],
    authorId: p[2],
    createdAt: now - (idx + 1) * 86400000 * 3,
    durationLabel: ['3:20', '4:05', '2:45', '5:10', '3:55'][p[3]]
  }));
}

const SEED_TUTORIALS = seedTutorials();
