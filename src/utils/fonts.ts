export interface FontItem {
  name: string;
  family: string;
  category: 'Hindi' | 'English' | 'Arabic' | 'Urdu' | 'Bengali' | 'Headline' | 'Bold' | 'Modern' | 'Display' | 'Handwritten' | 'Custom';
  sampleText: string;
  isCustom?: boolean;
}

export const SYSTEM_FONTS: FontItem[] = [
  // Hindi
  { name: 'Rozha One', family: "'Rozha One', serif", category: 'Hindi', sampleText: 'डिजाइन लैब प्रो' },
  { name: 'Poppins', family: "'Poppins', sans-serif", category: 'Hindi', sampleText: 'सुंदर हिंदी स्टाइल' },
  { name: 'Kalam', family: "'Kalam', cursive", category: 'Hindi', sampleText: 'हस्तलेखन स्टाइल' },
  { name: 'Rajdhani', family: "'Rajdhani', sans-serif", category: 'Hindi', sampleText: 'राजधानी बोल्ड फॉन्ट' },
  { name: 'Hind Siliguri', family: "'Hind Siliguri', sans-serif", category: 'Hindi', sampleText: 'हिंदी और बंगाली' },
  
  // English & Modern
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Modern', sampleText: 'MODERN STUDIO' },
  { name: 'Bebas Neue', family: "'Bebas Neue', cursive", category: 'Headline', sampleText: 'BREAKING HEADLINE' },
  { name: 'Anton', family: "'Anton', sans-serif", category: 'Bold', sampleText: 'EXTREME BOLD' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Display', sampleText: 'Luxury Editorial' },
  { name: 'Cinzel', family: "'Cinzel', serif", category: 'Display', sampleText: 'ROYAL CINEMATIC' },
  { name: 'Syne', family: "'Syne', sans-serif", category: 'Modern', sampleText: 'Creative Agency' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'English', sampleText: 'Clean Typography' },
  { name: 'Russo One', family: "'Russo One', sans-serif", category: 'Bold', sampleText: 'GAMING TITLE' },
  { name: 'Black Ops One', family: "'Black Ops One', cursive", category: 'Headline', sampleText: 'MILITARY STENCIL' },

  // Arabic & Urdu
  { name: 'Noto Naskh Arabic', family: "'Noto Naskh Arabic', serif", category: 'Arabic', sampleText: 'تصميم احترافي' },
  { name: 'Amiri', family: "'Amiri', serif", category: 'Urdu', sampleText: 'خوبصورت اردو خط' },
  { name: 'Cairo', family: "'Cairo', sans-serif", category: 'Arabic', sampleText: 'خط عربي حديث' },

  // Bengali
  { name: 'Hind Siliguri Bengali', family: "'Hind Siliguri', sans-serif", category: 'Bengali', sampleText: 'গ্রাফিক ডিজাইন' },

  // Handwritten
  { name: 'Pacifico', family: "'Pacifico', cursive", category: 'Handwritten', sampleText: 'Summer Vibes' },
  { name: 'Caveat', family: "'Caveat', cursive", category: 'Handwritten', sampleText: 'Handwritten notes' },
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Handwritten', sampleText: 'Signature Calligraphy' },
];

const DB_NAME = 'DesignLabFontsDB';
const STORE_NAME = 'custom_fonts';

function openFontDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredFont {
  name: string;
  family: string;
  dataUrl: string; // base64
  category: 'Custom';
}

export async function saveCustomFontToDB(font: StoredFont): Promise<void> {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(font);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomFontsFromDB(): Promise<StoredFont[]> {
  try {
    const db = await openFontDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Failed to load custom fonts', e);
    return [];
  }
}

export async function deleteCustomFontFromDB(name: string): Promise<void> {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadFontFileIntoDocument(name: string, bufferOrBase64: ArrayBuffer | string): Promise<string> {
  const fontFaceName = `Custom_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  let fontFace: FontFace;
  
  if (typeof bufferOrBase64 === 'string') {
    fontFace = new FontFace(fontFaceName, `url(${bufferOrBase64})`);
  } else {
    fontFace = new FontFace(fontFaceName, bufferOrBase64);
  }

  await fontFace.load();
  document.fonts.add(fontFace);
  return fontFaceName;
}

export async function initCustomFonts(): Promise<FontItem[]> {
  const stored = await getCustomFontsFromDB();
  const loadedList: FontItem[] = [];
  for (const item of stored) {
    try {
      const familyName = await loadFontFileIntoDocument(item.name, item.dataUrl);
      loadedList.push({
        name: item.name,
        family: `'${familyName}', sans-serif`,
        category: 'Custom',
        sampleText: item.name,
        isCustom: true,
      });
    } catch (err) {
      console.warn(`Could not load custom font ${item.name}`, err);
    }
  }
  return loadedList;
}
