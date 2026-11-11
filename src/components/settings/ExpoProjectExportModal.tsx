import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileCode, CheckCircle2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { DRIZZLE_SCHEMA_EXPO_CODE, SQL_TABLES_DEFINITIONS } from '../../db/schema';

interface ExpoProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoProjectExportModal: React.FC<ExpoProjectExportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const expoPackageJson = {
    name: 'kaly-budget-mobile',
    version: '1.0.0',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
    },
    dependencies: {
      expo: '~52.0.0',
      'expo-router': '~4.0.0',
      'expo-sqlite': '~15.0.0',
      'drizzle-orm': '^0.38.0',
      react: '18.3.1',
      'react-native': '0.76.5',
      'react-native-safe-area-context': '4.12.0',
      'react-native-screens': '~4.4.0',
      zustand: '^5.0.0',
      i18next: '^24.0.0',
      'react-i18next': '^15.0.0',
      'lucide-react-native': '^0.460.0',
      'react-hook-form': '^7.54.0',
      zod: '^3.24.0',
      '@hookform/resolvers': '^3.9.0',
    },
    devDependencies: {
      '@types/react': '~18.3.12',
      typescript: '^5.3.3',
      'drizzle-kit': '^0.30.0',
    },
    private: true,
  };

  const appJson = {
    expo: {
      name: 'KalyBudget',
      slug: 'kaly-budget',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      scheme: 'kalybudget',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#2563EB',
        },
      },
      plugins: ['expo-router', 'expo-sqlite'],
    },
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      // Project configurations
      zip.file('package.json', JSON.stringify(expoPackageJson, null, 2));
      zip.file('app.json', JSON.stringify(appJson, null, 2));
      zip.file('tsconfig.json', JSON.stringify({ extends: 'expo/tsconfig.base' }, null, 2));
      zip.file('drizzle.config.ts', `import { defineConfig } from 'drizzle-kit';\nexport default defineConfig({\n  schema: './src/db/schema.ts',\n  dialect: 'sqlite',\n  driver: 'expo',\n});\n`);

      // SQLite & Drizzle schema
      zip.file('src/db/schema.ts', DRIZZLE_SCHEMA_EXPO_CODE);
      zip.file('src/db/init.sql', SQL_TABLES_DEFINITIONS);

      // Readme instructions
      const readme = `# KalyBudget - Mobile App (React Native Expo + Drizzle ORM + SQLite)

Application MVP de gestion des dépenses personnelles développée avec :
- React Native & Expo (SDK 52)
- Expo Router
- Expo SQLite & Drizzle ORM
- Zustand (State management)
- i18next & react-i18next (FR / EN)
- React Hook Form & Zod
- Lucide React Native

## Démarrage rapide

1. Installez les dépendances :
\`\`\`bash
npm install
\`\`\`

2. Lancez l'application avec Expo :
\`\`\`bash
npx expo start
\`\`\`

3. Flashez le QR code avec l'application Expo Go sur votre téléphone Android ou iOS !
`;
      zip.file('README.md', readme);

      // Generate zip and trigger browser download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kaly-budget-expo-mobile.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setDownloading(false);
    }
  };

  const copyDrizzleSchema = () => {
    navigator.clipboard.writeText(DRIZZLE_SCHEMA_EXPO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.exportModalTitle')} maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('settings.exportModalDesc')}
        </p>

        {/* Download Zip CTA Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Download size={20} />
            <h4 className="font-extrabold text-sm">Téléchargement direct</h4>
          </div>
          <p className="text-xs text-blue-100">
            Exportez l'archive .zip complète avec tous les fichiers prêts pour <code>npx expo start</code> et testables immédiatement avec Expo Go.
          </p>
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-md hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {downloading ? 'Génération du zip...' : 'Télécharger le code Expo React Native (.zip)'}
          </button>
        </div>

        {/* Drizzle & SQLite schema preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileCode size={15} />
              Schéma Drizzle ORM (src/db/schema.ts)
            </span>
            <button
              onClick={copyDrizzleSchema}
              className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] rounded-xl font-mono overflow-x-auto max-h-48">
            {DRIZZLE_SCHEMA_EXPO_CODE}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
