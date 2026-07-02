// Maps ML model English disease names → Bengali display names.
// The model uses PlantVillage dataset naming conventions (Crop___Disease format).
// Names NOT in this map will display as-is in English in both language modes.
// FLAG: This list covers ~35 common diseases. Extend it as the model returns new names.
const DISEASE_NAME_BN = {
  // Tomato
  'Tomato Early Blight':                   'টমেটো আর্লি ব্লাইট',
  'Tomato Late Blight':                    'টমেটো লেট ব্লাইট',
  'Tomato Leaf Mold':                      'টমেটো পাতার ছত্রাক',
  'Tomato Septoria Leaf Spot':             'টমেটো সেপটোরিয়া দাগ',
  'Tomato Spider Mites Two Spotted Spider Mite': 'টমেটো মাকড়সার পোকা',
  'Tomato Target Spot':                    'টমেটো টার্গেট স্পট',
  'Tomato Tomato Yellow Leaf Curl Virus':  'টমেটো হলুদ পাতা কোঁকড়ানো ভাইরাস',
  'Tomato Tomato Mosaic Virus':            'টমেটো মোজাইক ভাইরাস',
  'Tomato Bacterial Spot':                 'টমেটো ব্যাকটেরিয়াল স্পট',
  'Tomato Healthy':                        'টমেটো সুস্থ',
  // Potato
  'Potato Early Blight':                   'আলুর আর্লি ব্লাইট',
  'Potato Late Blight':                    'আলুর লেট ব্লাইট',
  'Potato Healthy':                        'আলু সুস্থ',
  // Corn / Maize
  'Corn Cercospora Leaf Spot Gray Leaf Spot': 'ভুট্টার পাতার দাগ',
  'Corn Common Rust':                      'ভুট্টার সাধারণ মরিচা',
  'Corn Northern Leaf Blight':             'ভুট্টার নর্দার্ন ব্লাইট',
  'Corn Healthy':                          'ভুট্টা সুস্থ',
  // Apple
  'Apple Apple Scab':                      'আপেলের স্ক্যাব',
  'Apple Black Rot':                       'আপেলের কালো পচন',
  'Apple Cedar Apple Rust':                'আপেলের সেডার রাস্ট',
  'Apple Healthy':                         'আপেল সুস্থ',
  // Grape
  'Grape Black Rot':                       'আঙুরের কালো পচন',
  'Grape Esca Black Measles':              'আঙুরের ব্ল্যাক মিজলস',
  'Grape Leaf Blight Isariopsis Leaf Spot': 'আঙুরের পাতার দাগ',
  'Grape Healthy':                         'আঙুর সুস্থ',
  // Pepper
  'Pepper Bell Bacterial Spot':            'মরিচের ব্যাকটেরিয়াল স্পট',
  'Pepper Bell Healthy':                   'মরিচ সুস্থ',
  // Strawberry
  'Strawberry Leaf Scorch':               'স্ট্রবেরির পাতার পোড়া',
  'Strawberry Healthy':                    'স্ট্রবেরি সুস্থ',
  // Rice  — FLAG: model may use different naming for rice diseases; verify these
  'Rice Blast':                            'ধানের ব্লাস্ট রোগ',
  'Rice Brown Spot':                       'ধানের বাদামি দাগ',
  'Rice Narrow Brown Leaf Spot':           'ধানের সরু বাদামি দাগ',
  'Rice Neck Blast':                       'ধানের ঘাড় ব্লাস্ট',
  'Rice Tungro':                           'ধানের টুংরো ভাইরাস',
  'Rice Healthy':                          'ধান সুস্থ',
  // Wheat — FLAG: wheat disease names depend on which model variant is active
  'Wheat Stripe Rust':                     'গমের ডোরা মরিচা',
  'Wheat Brown Rust':                      'গমের বাদামি মরিচা',
  'Wheat Yellow Rust':                     'গমের হলুদ মরিচা',
  'Wheat Septoria':                        'গমের সেপটোরিয়া',
  'Wheat Healthy':                         'গম সুস্থ',
  // Generic
  'Healthy': 'সুস্থ',
  'Unknown': 'অজানা',
}

/**
 * Returns the Bengali name for a disease if available, otherwise returns the
 * original English name (acceptable for technical terms).
 * @param {string} englishName
 * @returns {string}
 */
export function getDiseaseName(englishName, lang = 'bn') {
  if (lang !== 'bn') return englishName
  return DISEASE_NAME_BN[englishName] ?? englishName
}

export default DISEASE_NAME_BN
