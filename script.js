/**
 * NutriFit — Modern Wellness, Nutrition & Fitness Web Platform
 * Branding: Eat Better. Move Better. Live Better.
 * Crafted with care by Hazr Studios
 * 
 * Strict Technology: Vanilla ES6+ JavaScript, 100% Client-Side LocalStorage.
 * No external runtime dependencies or build tools required.
 */

// ============================================================================
// 1. DATA STORAGE & PERSISTENCE LAYER (localStorage Helpers)
// ============================================================================

const STORAGE_PREFIX = 'nutrifit_';

/**
 * Retrieve data safely from localStorage with fallback
 * @param {string} key - storage key
 * @param {*} fallback - fallback value if not found or corrupted
 */
function getData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[NutriFit Storage] Failed to read key: ${key}`, err);
    return fallback;
  }
}

/**
 * Set data in localStorage safely
 * @param {string} key - storage key
 * @param {*} value - data to serialize
 */
function setData(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[NutriFit Storage] Failed to write key: ${key}`, err);
    showToast('Storage quota exceeded or private mode error.', 'error');
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key 
 */
function removeData(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (err) {
    console.warn(`[NutriFit Storage] Failed to remove key: ${key}`, err);
    return false;
  }
}

/**
 * Update existing data via a transformer callback function
 * @param {string} key 
 * @param {Function} updater 
 * @param {*} fallback 
 */
function updateData(key, updater, fallback = null) {
  const current = getData(key, fallback);
  const updated = updater(current);
  setData(key, updated);
  return updated;
}

/**
 * Clear all NutriFit-specific data from localStorage
 */
function clearNutriFitData() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    return true;
  } catch (err) {
    console.error('[NutriFit Storage] Clear failed', err);
    return false;
  }
}

/**
 * Export all user data as a formatted JSON string for download
 */
function exportUserData() {
  const exportPayload = {
    brand: 'NutriFit by Hazr Studios',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    data: {}
  };

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      const cleanKey = k.replace(STORAGE_PREFIX, '');
      exportPayload.data[cleanKey] = getData(cleanKey);
    }
  }

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `NutriFit_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('NutriFit backup JSON exported successfully!', 'success');
}

/**
 * Import user data from an uploaded JSON file
 * @param {File} file 
 */
function importUserData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !parsed.data) {
        throw new Error('Invalid NutriFit backup file format.');
      }
      Object.keys(parsed.data).forEach(key => {
        setData(key, parsed.data[key]);
      });
      showToast('Data imported successfully! Refreshing...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Import error', err);
      showToast('Error importing file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// Helper: Get local date formatted as YYYY-MM-DD
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// 2. INITIAL SEED DATA (Recipes, Workouts, Articles, Substitutions, Habits)
// ============================================================================

const SEED_RECIPES = [
  {
    id: 'rec_1',
    title: 'Avocado & Smoked Salmon Protein Toast',
    category: 'breakfast',
    prepTime: 12,
    servings: 2,
    calories: 360,
    protein: 26,
    carbs: 24,
    fat: 16,
    dietaryTags: ['High-Protein', 'Pescatarian'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&auto=format&fit=crop&q=80',
    description: 'Crispy whole grain sourdough topped with smashed lime avocado, wild smoked salmon, and microgreens.',
    allergyNotes: 'Contains fish, gluten. Gluten-free bread can be substituted.',
    ingredients: [
      { name: 'Slices artisan sourdough bread', amount: 2, unit: '' },
      { name: 'Ripe Hass avocado', amount: 1, unit: '' },
      { name: 'Wild Alaskan smoked salmon', amount: 100, unit: 'g' },
      { name: 'Fresh lime juice', amount: 1, unit: 'tbsp' },
      { name: 'Fresh dill & microgreens', amount: 2, unit: 'tbsp' },
      { name: 'Red pepper flakes & sea salt', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Toast sourdough slices until firm, fragrant, and golden brown.',
      'In a small bowl, roughly mash the avocado with fresh lime juice, sea salt, and black pepper.',
      'Evenly spread mashed avocado across warm toast slices.',
      'Drape smoked salmon over avocado and garnish with fresh dill, microgreens, and red pepper flakes.'
    ]
  },
  {
    id: 'rec_2',
    title: 'Mediterranean Quinoa & Herb Power Bowl',
    category: 'lunch',
    prepTime: 20,
    servings: 2,
    calories: 440,
    protein: 18,
    carbs: 58,
    fat: 15,
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'High-Protein'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80',
    description: 'Fluffy rainbow quinoa paired with Persian cucumbers, cherry tomatoes, Kalamata olives, creamy feta, and lemon oregano dressing.',
    allergyNotes: 'Contains dairy (feta). Sub dairy-free feta for vegan.',
    ingredients: [
      { name: 'Cooked tri-color quinoa', amount: 2, unit: 'cups' },
      { name: 'Persian cucumbers, diced', amount: 1.5, unit: 'cups' },
      { name: 'Cherry tomatoes, halved', amount: 1, unit: 'cup' },
      { name: 'Kalamata olives, pitted', amount: 0.33, unit: 'cup' },
      { name: 'Crumbled sheep feta cheese', amount: 60, unit: 'g' },
      { name: 'Canned chickpeas, rinsed & drained', amount: 1, unit: 'cup' },
      { name: 'Extra virgin olive oil', amount: 2, unit: 'tbsp' },
      { name: 'Fresh lemon juice', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Prepare or reheat fluffy quinoa and let it cool slightly.',
      'In a large mixing bowl, whisk together extra virgin olive oil, lemon juice, dried oregano, salt, and pepper.',
      'Add cooked quinoa, chickpeas, diced cucumbers, tomatoes, and Kalamata olives.',
      'Toss thoroughly to dress. Divide into wide serving bowls and crown with crumbled feta and fresh mint.'
    ]
  },
  {
    id: 'rec_3',
    title: 'Pan-Seared Citrus Herb Salmon & Asparagus',
    category: 'dinner',
    prepTime: 22,
    servings: 2,
    calories: 480,
    protein: 42,
    carbs: 12,
    fat: 28,
    dietaryTags: ['High-Protein', 'Gluten-Free', 'Low-Carb'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=700&auto=format&fit=crop&q=80',
    description: 'Crispy skin wild salmon fillets glazed with Meyer lemon zest, served with tender blistered green asparagus.',
    allergyNotes: 'Contains fish. Dairy-free.',
    ingredients: [
      { name: 'Wild-caught salmon fillets', amount: 2, unit: 'fillets (360g)' },
      { name: 'Fresh pencil asparagus, trimmed', amount: 1, unit: 'bunch (300g)' },
      { name: 'Avocado oil for searing', amount: 1.5, unit: 'tbsp' },
      { name: 'Minced garlic cloves', amount: 3, unit: 'cloves' },
      { name: 'Lemon zest & juice', amount: 1, unit: 'lemon' },
      { name: 'Chopped fresh flat-leaf parsley', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Pat salmon fillets completely dry with paper towels; season generously with coarse sea salt and cracked pepper.',
      'Heat avocado oil in a stainless steel or cast-iron skillet over medium-high heat until shimmering.',
      'Place salmon skin-side down; press lightly with a spatula for 10 seconds. Sear for 5 minutes until skin is golden crisp.',
      'Flip salmon, add trimmed asparagus spears and minced garlic to pan. Sauté for another 3–4 minutes until salmon is just cooked through.',
      'Deglaze with fresh lemon juice and shower with chopped parsley before serving.'
    ]
  },
  {
    id: 'rec_4',
    title: 'Golden Turmeric & Chia Overnight Oats',
    category: 'breakfast',
    prepTime: 8,
    servings: 1,
    calories: 340,
    protein: 16,
    carbs: 48,
    fat: 10,
    dietaryTags: ['Vegan', 'Gluten-Free', 'Vegetarian'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
    description: 'Anti-inflammatory overnight oats infused with organic turmeric, ground cinnamon, chia seeds, and pure almond milk.',
    allergyNotes: 'Contains almonds. Nut-free seed milk can be substituted.',
    ingredients: [
      { name: 'Certified gluten-free rolled oats', amount: 0.5, unit: 'cup' },
      { name: 'Unsweetened almond milk', amount: 0.75, unit: 'cup' },
      { name: 'Black chia seeds', amount: 1, unit: 'tbsp' },
      { name: 'Ground organic turmeric', amount: 0.5, unit: 'tsp' },
      { name: 'Ceylon cinnamon & pinch black pepper', amount: 0.25, unit: 'tsp' },
      { name: 'Plant-based vanilla protein powder (optional)', amount: 15, unit: 'g' },
      { name: 'Fresh blueberries for topping', amount: 0.25, unit: 'cup' }
    ],
    instructions: [
      'Combine rolled oats, chia seeds, turmeric, cinnamon, pinch of black pepper, and protein powder in a glass jar.',
      'Pour in unsweetened almond milk and stir vigorously until no dry pockets remain.',
      'Seal jar and refrigerate overnight (or at least 4 hours) to develop a rich, creamy pudding texture.',
      'In the morning, top with fresh plump blueberries and raw pumpkin seeds.'
    ]
  },
  {
    id: 'rec_5',
    title: 'Grilled Lemon Herb Chicken & Sweet Potato Bowl',
    category: 'lunch',
    prepTime: 25,
    servings: 2,
    calories: 520,
    protein: 46,
    carbs: 44,
    fat: 14,
    dietaryTags: ['High-Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
    description: 'Herb-marinated grilled chicken breast slices served over roasted sweet potato cubes and crisp garden greens.',
    allergyNotes: 'Naturally dairy-free, gluten-free, egg-free.',
    ingredients: [
      { name: 'Skinless organic chicken breasts', amount: 350, unit: 'g' },
      { name: 'Roasted sweet potato cubes', amount: 2, unit: 'cups' },
      { name: 'Mixed baby greens or spinach', amount: 3, unit: 'cups' },
      { name: 'Dijon mustard & apple cider vinegar', amount: 1, unit: 'tbsp' },
      { name: 'Extra virgin olive oil', amount: 1.5, unit: 'tbsp' },
      { name: 'Dried thyme & oregano', amount: 1, unit: 'tsp' }
    ],
    instructions: [
      'Toss chicken breast cutlets with olive oil, dried thyme, oregano, salt, and black pepper.',
      'Grill on medium-high heat for 6–7 minutes per side until internal temperature reaches 165°F (74°C). Let rest 5 minutes, then slice.',
      'Roast cubed sweet potatoes at 400°F (200°C) with light olive oil until caramelized and tender.',
      'Assemble bowls with mixed greens, warm roasted sweet potatoes, sliced chicken breast, and drizzle with Dijon vinaigrette.'
    ]
  },
  {
    id: 'rec_6',
    title: 'Creamy Spinach & Lentil Dahl with Ginger',
    category: 'dinner',
    prepTime: 30,
    servings: 4,
    calories: 380,
    protein: 21,
    carbs: 56,
    fat: 8,
    dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free', 'High-Protein'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&auto=format&fit=crop&q=80',
    description: 'Comforting, protein-rich red lentil stew simmered in coconut milk, fresh ginger, cumin, and baby spinach.',
    allergyNotes: 'Contains coconut. Gluten-free and completely plant-based.',
    ingredients: [
      { name: 'Split red lentils, rinsed', amount: 1.5, unit: 'cups' },
      { name: 'Light coconut milk', amount: 1, unit: 'can (400ml)' },
      { name: 'Low-sodium vegetable broth', amount: 2.5, unit: 'cups' },
      { name: 'Fresh baby spinach', amount: 3, unit: 'cups' },
      { name: 'Finely grated fresh ginger & garlic', amount: 2, unit: 'tbsp' },
      { name: 'Ground cumin, coriander & turmeric', amount: 2, unit: 'tsp' }
    ],
    instructions: [
      'Sauté grated ginger, garlic, and dry spices in olive oil over medium heat for 60 seconds until aromatic.',
      'Add rinsed red lentils, coconut milk, and vegetable broth. Bring to a lively simmer.',
      'Reduce heat to low, cover partially, and simmer gently for 20 minutes until lentils soften into a velvety consistency.',
      'Fold in baby spinach until wilted. Season with sea salt and squeeze of lime juice.'
    ]
  },
  {
    id: 'rec_7',
    title: 'Matcha Green Superfood Protein Smoothie',
    category: 'snack',
    prepTime: 5,
    servings: 1,
    calories: 260,
    protein: 24,
    carbs: 28,
    fat: 5,
    dietaryTags: ['Vegetarian', 'High-Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=700&auto=format&fit=crop&q=80',
    description: 'Ceremonial grade Japanese matcha blended with frozen banana, baby kale, and clean plant protein.',
    allergyNotes: 'Dairy-free with plant protein; check protein label for soy or nut allergens.',
    ingredients: [
      { name: 'Ceremonial matcha green tea powder', amount: 1, unit: 'tsp' },
      { name: 'Vanilla protein powder (plant or whey)', amount: 25, unit: 'g' },
      { name: 'Frozen ripe banana', amount: 1, unit: 'medium' },
      { name: 'Fresh baby spinach or kale', amount: 1, unit: 'packed cup' },
      { name: 'Unsweetened oat or coconut milk', amount: 1.25, unit: 'cups' },
      { name: 'Ice cubes', amount: 4, unit: 'cubes' }
    ],
    instructions: [
      'Add oat milk, matcha powder, spinach, frozen banana, and protein powder to high-speed blender.',
      'Blend on low speed for 15 seconds to incorporate greens, then switch to high speed for 45 seconds until silky smooth.',
      'Pour into chilled tall glass and enjoy immediately for sustained, jitter-free morning focus.'
    ]
  },
  {
    id: 'rec_8',
    title: 'Dark Chocolate & Sea Salt Energy Bites',
    category: 'snack',
    prepTime: 15,
    servings: 8,
    calories: 140,
    protein: 5,
    carbs: 18,
    fat: 6,
    difficulty: 'easy',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Vegetarian'],
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=700&auto=format&fit=crop&q=80',
    description: 'No-bake wholesome snack spheres made from Medjool dates, raw almonds, chia seeds, and 85% cacao.',
    allergyNotes: 'Contains almonds. Can be prepared with sunflower seed butter.',
    ingredients: [
      { name: 'Medjool dates, pitted', amount: 10, unit: 'dates' },
      { name: 'Raw whole almonds or walnuts', amount: 1, unit: 'cup' },
      { name: 'Unsweetened Dutch cacao powder', amount: 3, unit: 'tbsp' },
      { name: 'Flaxseed meal or chia seeds', amount: 2, unit: 'tbsp' },
      { name: 'Flaky Maldon sea salt', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Pulse almonds in food processor until coarsely crumbled.',
      'Add pitted Medjool dates, cacao powder, chia seeds, and a pinch of salt. Pulse until a sticky dough forms that clumps together when pressed.',
      'Roll tablespoon portions into uniform spheres.',
      'Dust with sea salt flakes and store in airtight glass container in refrigerator for up to two weeks.'
    ]
  },
  {
    id: 'rec_9',
    title: 'Crispy Baked Sesame Tofu & Edamame Bowl',
    category: 'dinner',
    prepTime: 25,
    servings: 2,
    calories: 420,
    protein: 30,
    carbs: 38,
    fat: 16,
    difficulty: 'easy',
    dietaryTags: ['Vegan', 'High-Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=700&auto=format&fit=crop&q=80',
    description: 'Golden pressed organic tofu cubes baked to a crunch, tossed in tamari-ginger glaze with shelled edamame and brown jasmine rice.',
    allergyNotes: 'Contains soy and sesame. Use coconut aminos for soy-free.',
    ingredients: [
      { name: 'Extra-firm organic tofu, pressed & cubed', amount: 350, unit: 'g' },
      { name: 'Shelled edamame beans', amount: 1, unit: 'cup' },
      { name: 'Cooked brown jasmine rice', amount: 1.5, unit: 'cups' },
      { name: 'Toasted sesame oil & tamari', amount: 1.5, unit: 'tbsp' },
      { name: 'Arrowroot or cornstarch for crisping', amount: 1, unit: 'tbsp' },
      { name: 'Toasted sesame seeds & scallions', amount: 1, unit: 'tbsp' }
    ],
    instructions: [
      'Toss tofu cubes with arrowroot starch, tamari, and a drizzle of sesame oil.',
      'Bake at 400°F (200°C) for 22 minutes, flipping halfway until edges are deeply golden and crisp.',
      'Steam shelled edamame until vibrant green.',
      'Assemble warm brown rice in bowls, top with baked tofu, edamame, and garnish with sliced green scallions.'
    ]
  },
  {
    id: 'rec_10',
    title: 'Zesty Mango Citrus Shrimp Skewers',
    category: 'dinner',
    prepTime: 18,
    servings: 2,
    calories: 340,
    protein: 36,
    carbs: 22,
    fat: 8,
    difficulty: 'easy',
    dietaryTags: ['Pescatarian', 'High-Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=700&auto=format&fit=crop&q=80',
    description: 'Marinated jumbo wild shrimp grilled with fresh lime, garlic, and served with a fiery mango cilantro salsa.',
    allergyNotes: 'Contains shellfish. Gluten-free and dairy-free.',
    ingredients: [
      { name: 'Wild jumbo shrimp, peeled & deveined', amount: 350, unit: 'g' },
      { name: 'Ripe mango, diced', amount: 1, unit: 'cup' },
      { name: 'Red onion & jalapeno, minced', amount: 0.25, unit: 'cup' },
      { name: 'Fresh lime juice & zest', amount: 2, unit: 'limes' },
      { name: 'Extra virgin olive oil', amount: 1, unit: 'tbsp' },
      { name: 'Fresh cilantro leaves', amount: 0.25, unit: 'cup' }
    ],
    instructions: [
      'Thread jumbo shrimp onto skewers; brush with olive oil, minced garlic, sea salt, and smoked paprika.',
      'Grill or sear in cast-iron skillet for 2–3 minutes per side until pink and opaque.',
      'Toss diced mango with red onion, cilantro, jalapeno, and fresh lime juice.',
      'Serve warm skewers over the chilled mango salsa.'
    ]
  },
  {
    id: 'rec_11',
    title: 'Berry Antioxidant & Coconut Chia Pudding',
    category: 'breakfast',
    prepTime: 10,
    servings: 2,
    calories: 280,
    protein: 10,
    carbs: 32,
    fat: 14,
    difficulty: 'easy',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Vegetarian'],
    image: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=700&auto=format&fit=crop&q=80',
    description: 'Slow-hydrated white chia seeds in light coconut milk topped with wild blackberry and blueberry reduction.',
    allergyNotes: 'Contains coconut. Gluten-free, nut-free, dairy-free.',
    ingredients: [
      { name: 'Black or white chia seeds', amount: 0.33, unit: 'cup' },
      { name: 'Coconut or cashew milk', amount: 1.5, unit: 'cups' },
      { name: 'Pure vanilla bean paste', amount: 0.5, unit: 'tsp' },
      { name: 'Pure maple syrup', amount: 1, unit: 'tbsp' },
      { name: 'Fresh wild blackberries & blueberries', amount: 1, unit: 'cup' }
    ],
    instructions: [
      'Whisk chia seeds, coconut milk, maple syrup, and vanilla together in a glass container.',
      'Wait 5 minutes and whisk once more to avoid clumping, then chill for at least 3 hours.',
      'In a small saucepan, gently warm berries until juices release.',
      'Layer chia pudding into chilled glasses and spoon warm berry reduction over top.'
    ]
  },
  {
    id: 'rec_12',
    title: 'Grass-Fed Beef & Tender Broccoli Sauté',
    category: 'dinner',
    prepTime: 20,
    servings: 2,
    calories: 490,
    protein: 44,
    carbs: 18,
    fat: 22,
    difficulty: 'medium',
    dietaryTags: ['High-Protein', 'Gluten-Free', 'Low-Carb'],
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=700&auto=format&fit=crop&q=80',
    description: 'Thinly sliced grass-fed flank steak seared with crisp broccoli florets, ginger, garlic, and coconut aminos.',
    allergyNotes: 'Naturally dairy-free and gluten-free (using gluten-free tamari or coconut aminos).',
    ingredients: [
      { name: 'Grass-fed flank or sirloin steak, thinly sliced', amount: 350, unit: 'g' },
      { name: 'Fresh broccoli florets', amount: 3, unit: 'cups' },
      { name: 'Coconut aminos or tamari', amount: 2, unit: 'tbsp' },
      { name: 'Minced fresh ginger & garlic', amount: 1.5, unit: 'tbsp' },
      { name: 'Avocado oil for searing', amount: 1, unit: 'tbsp' },
      { name: 'Toasted sesame seeds', amount: 1, unit: 'tsp' }
    ],
    instructions: [
      'Slice beef thinly against the grain; season with pepper and a splash of coconut aminos.',
      'Heat avocado oil in wok or heavy skillet until smoking hot; flash-sear beef for 90 seconds until caramelized. Remove beef.',
      'Add broccoli florets and 2 tbsp water to pan; cover for 2 minutes to steam-tenderize.',
      'Return beef to wok with garlic and ginger; toss vigorously for 60 seconds. Finish with sesame seeds.'
    ]
  },
  {
    id: 'rec_13',
    title: 'Hearty Tuscan White Bean & Rosemary Stew',
    category: 'lunch',
    prepTime: 30,
    servings: 3,
    calories: 360,
    protein: 17,
    carbs: 54,
    fat: 7,
    difficulty: 'medium',
    dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&auto=format&fit=crop&q=80',
    description: 'Slow-simmered Cannellini beans with chopped Tuscan kale, fire-roasted tomatoes, fresh rosemary, and garlic.',
    allergyNotes: 'Gluten-free, vegan, nut-free, dairy-free.',
    ingredients: [
      { name: 'Cannellini white beans, rinsed', amount: 2, unit: 'cans (800g)' },
      { name: 'Lacinato kale, stems removed & chopped', amount: 3, unit: 'cups' },
      { name: 'Fire-roasted crushed tomatoes', amount: 1, unit: 'can (400g)' },
      { name: 'Fresh rosemary sprig & thyme', amount: 2, unit: 'sprigs' },
      { name: 'Vegetable broth', amount: 2, unit: 'cups' },
      { name: 'Extra virgin olive oil', amount: 1, unit: 'tbsp' }
    ],
    instructions: [
      'Sauté minced garlic and rosemary in olive oil in a deep pot until fragrant.',
      'Pour in fire-roasted tomatoes and vegetable broth; bring to a simmer.',
      'Add cannellini beans; use wooden spoon to mash a quarter of the beans to naturally thicken the stew broth.',
      'Stir in Tuscan kale and simmer for 10 minutes until tender. Season with sea salt and cracked pepper.'
    ]
  },
  {
    id: 'rec_14',
    title: 'Baked Spinach & Feta Protein Egg Cups',
    category: 'breakfast',
    prepTime: 22,
    servings: 4,
    calories: 220,
    protein: 20,
    carbs: 4,
    fat: 14,
    difficulty: 'easy',
    dietaryTags: ['Vegetarian', 'High-Protein', 'Gluten-Free', 'Low-Carb'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&auto=format&fit=crop&q=80',
    description: 'Wholesome breakfast frittata cups loaded with fresh baby spinach, crumbled feta, and pasture-raised eggs.',
    allergyNotes: 'Contains eggs, dairy (feta). Gluten-free.',
    ingredients: [
      { name: 'Pasture-raised large eggs', amount: 6, unit: 'eggs' },
      { name: 'Liquid egg whites', amount: 0.5, unit: 'cup' },
      { name: 'Fresh baby spinach, roughly chopped', amount: 2, unit: 'cups' },
      { name: 'Crumbled sheep feta cheese', amount: 60, unit: 'g' },
      { name: 'Dried oregano & sea salt', amount: 0.5, unit: 'tsp' }
    ],
    instructions: [
      'Preheat oven to 350°F (175°C). Lightly grease a 6-cup muffin tin with olive oil.',
      'Whisk whole eggs, egg whites, dried oregano, salt, and black pepper until frothy.',
      'Divide chopped spinach and crumbled feta into each muffin cavity.',
      'Pour egg mixture over vegetables. Bake for 18–20 minutes until puffed and set in the center.'
    ]
  }
];

const SEED_WORKOUTS = [
  {
    id: 'wo_1',
    title: 'Full-Body Metabolic HIIT Circuit',
    category: 'hiit',
    difficulty: 'intermediate',
    durationMinutes: 24,
    caloriesBurned: 240,
    equipment: 'Bodyweight (Yoga Mat optional)',
    focus: 'Cardiovascular conditioning & total body endurance',
    exercises: [
      { name: 'Jumping Jacks Warmup', durationSec: 45, restSec: 15 },
      { name: 'Bodyweight Air Squats', durationSec: 45, restSec: 15 },
      { name: 'Push-ups (Standard or Knee)', durationSec: 45, restSec: 15 },
      { name: 'High Knees Sprint in Place', durationSec: 45, restSec: 15 },
      { name: 'Plank Hold with Shoulder Taps', durationSec: 45, restSec: 15 },
      { name: 'Reverse Lunges with Kick', durationSec: 45, restSec: 15 },
      { name: 'Mountain Climbers', durationSec: 45, restSec: 15 },
      { name: 'Cool Down Child Pose Stretch', durationSec: 60, restSec: 0 }
    ],
    instructions: 'Perform each exercise with controlled tempo and maximum focus on form. Complete 2 complete circuits with 90 seconds rest between cycles.',
    safetyTips: 'Keep your core braced during push-ups and planks to prevent hyperextension of the lumbar spine.'
  },
  {
    id: 'wo_2',
    title: 'Core Strength & Functional Stability',
    category: 'strength',
    difficulty: 'beginner',
    durationMinutes: 18,
    caloriesBurned: 130,
    equipment: 'Yoga Mat',
    focus: 'Deep transverse abdominis, obliques, and lumbar support',
    exercises: [
      { name: 'Cat-Cow Spinal Activation', durationSec: 60, restSec: 10 },
      { name: 'Bird-Dog Isometric Holds', durationSec: 45, restSec: 15 },
      { name: 'Dead Bug Contralateral Extensions', durationSec: 45, restSec: 15 },
      { name: 'Forearm Plank with Glute Squeeze', durationSec: 45, restSec: 20 },
      { name: 'Side Plank (Right)', durationSec: 30, restSec: 10 },
      { name: 'Side Plank (Left)', durationSec: 30, restSec: 15 },
      { name: 'Glute Bridge Holds', durationSec: 45, restSec: 15 }
    ],
    instructions: 'Slow and deliberate cadence. Breathe smoothly through each contraction without holding breath.',
    safetyTips: 'Keep lower back pressed flat into the floor during Dead Bugs.'
  },
  {
    id: 'wo_3',
    title: 'Upper Body Dumbbell Hypertrophy',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 32,
    caloriesBurned: 270,
    equipment: 'Pair of medium dumbbells (5–12kg)',
    focus: 'Shoulders, chest, lats, and triceps',
    exercises: [
      { name: 'Arm Circles & Band Pull-Aparts', durationSec: 60, restSec: 15 },
      { name: 'Dumbbell Neutral Grip Floor Press', durationSec: 50, restSec: 25 },
      { name: 'Bent-Over Dumbbell Rows', durationSec: 50, restSec: 25 },
      { name: 'Standing Overhead Dumbbell Press', durationSec: 45, restSec: 25 },
      { name: 'Dumbbell Hammer Curls', durationSec: 45, restSec: 20 },
      { name: 'Overhead Tricep Dumbbell Extension', durationSec: 45, restSec: 20 }
    ],
    instructions: 'Focus on a 2-second concentric lift and 3-second controlled eccentric descent.',
    safetyTips: 'Do not swing hips during overhead press; lock your ribs down.'
  },
  {
    id: 'wo_4',
    title: 'Desk Worker Decompression & Hip Opener',
    category: 'mobility',
    difficulty: 'beginner',
    durationMinutes: 15,
    caloriesBurned: 70,
    equipment: 'No equipment',
    focus: 'Hip flexors, thoracic spine, neck, and hamstring flexibility',
    exercises: [
      { name: 'Neck Rolls & Shoulder Shrugs', durationSec: 45, restSec: 10 },
      { name: 'Standing Chest Expansion & Clasp', durationSec: 45, restSec: 10 },
      { name: 'World’s Greatest Stretch (Lunge + Twist)', durationSec: 60, restSec: 15 },
      { name: 'Half-Kneeling Hip Flexor Stretch', durationSec: 60, restSec: 15 },
      { name: 'Pigeon Pose or Figure-4 Stretch', durationSec: 60, restSec: 15 },
      { name: 'Supine Spinal Twist', durationSec: 60, restSec: 0 }
    ],
    instructions: 'Breathe deeply into each position. Do not bounce or force painful ranges of motion.',
    safetyTips: 'Stop immediately if you experience sharp nerve pinch in hips or lower back.'
  },
  {
    id: 'wo_5',
    title: 'Bodyweight Lower Body Sculpt',
    category: 'home',
    difficulty: 'intermediate',
    durationMinutes: 22,
    caloriesBurned: 190,
    equipment: 'Bodyweight only',
    focus: 'Quadriceps, hamstrings, gluteus medius, and calves',
    exercises: [
      { name: 'Dynamic Calf Raises', durationSec: 45, restSec: 15 },
      { name: 'Tempo Squats (3 sec down, 1 sec up)', durationSec: 50, restSec: 20 },
      { name: 'Alternating Walking Lunges', durationSec: 50, restSec: 20 },
      { name: 'Sumo Squat Pulse', durationSec: 40, restSec: 20 },
      { name: 'Single-Leg Glute Bridges', durationSec: 45, restSec: 20 },
      { name: 'Wall Sit Isometric Burn', durationSec: 45, restSec: 30 }
    ],
    instructions: 'Drive through your heels on all squat and lunge patterns to maximize glute recruitment.',
    safetyTips: 'Track knees over second toe; avoid letting knees cave inward.'
  },
  {
    id: 'wo_6',
    title: 'Quick 10-Minute Morning Awakening Flow',
    category: 'quick',
    difficulty: 'beginner',
    durationMinutes: 10,
    caloriesBurned: 60,
    equipment: 'No equipment',
    focus: 'Total body wake-up, circulation, and joint lubrication',
    exercises: [
      { name: 'Standing Deep Belly Breaths', durationSec: 45, restSec: 10 },
      { name: 'Gentle Torso Twists', durationSec: 45, restSec: 10 },
      { name: 'Downward Facing Dog to Cobra Flow', durationSec: 60, restSec: 15 },
      { name: 'Bodyweight Good Mornings', durationSec: 45, restSec: 10 },
      { name: 'Light Shadow Boxing or Stepping', durationSec: 60, restSec: 0 }
    ],
    instructions: 'Ideal upon waking before coffee. Hydrate with a tall glass of water before starting.',
    safetyTips: 'Move gently—morning spine and discs are naturally hydrated and more sensitive.'
  }
];

const SEED_ARTICLES = [
  {
    id: 'art_1',
    title: 'The Science of Protein Leverage: Why Protein Controls Hunger',
    category: 'nutrition',
    readTime: '5 min read',
    author: 'Hazr Studios Wellness Team',
    date: 'Oct 2026',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&auto=format&fit=crop&q=80',
    excerpt: 'Discover why prioritizing adequate protein at every meal regulates peptide YY, suppresses ghrelin, and prevents late-night cravings naturally.',
    content: `
      <p>The protein leverage hypothesis, originally developed by evolutionary biologists Stephen Simpson and David Raubenheimer, suggests that humans maintain a biologically prioritized appetite for protein. If our dietary intake does not meet our body’s baseline amino acid requirements, we will subconsciously continue eating carbohydrate and fat calories until that protein demand is satisfied.</p>
      
      <h4>The Hormonal Cascade of High-Protein Meals</h4>
      <p>When you consume a meal rich in complete proteins (such as eggs, poultry, fish, tofu, or Greek yogurt), your digestive tract releases Peptide YY (PYY) and Glucagon-Like Peptide-1 (GLP-1), two potent satiety hormones. Simultaneously, circulating levels of ghrelin—the primary hunger-stimulating hormone produced in the stomach—drop precipitously.</p>

      <h4>Practical Rule of Thumb</h4>
      <p>Aim for 1.6 to 2.2 grams of protein per kilogram of target body weight daily, distributed across 3 to 4 meals containing 25–40g of protein each. This maintains steady muscle protein synthesis while keeping hunger comfortably at bay.</p>
    `,
    keyTakeaways: [
      'Protein provides the highest thermic effect of food (TEF), burning 20-30% of its caloric value during digestion.',
      'Even modest increases in breakfast protein significantly suppress evening sugar cravings.',
      'Opt for bioavailable whole food sources whenever possible.'
    ]
  },
  {
    id: 'art_2',
    title: 'Progressive Overload Without Heavy Gym Machinery',
    category: 'fitness',
    readTime: '6 min read',
    author: 'Hazr Studios Movement Coach',
    date: 'Oct 2026',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80',
    excerpt: 'You do not need an expensive commercial gym to build muscular resilience. Master mechanical advantage, tempo manipulation, and volume progression.',
    content: `
      <p>Many individuals believe that muscular hypertrophy and bone density improvements can only be achieved under heavy barbell racks. However, mechanical tension—the primary driver of muscular adaptation—can be applied effectively with simple bodyweight geometry and light resistance bands.</p>
      
      <h4>1. Increasing Time Under Tension (TUT)</h4>
      <p>Instead of rushing through 15 quick push-ups, execute a 3-second lowering phase, a 1-second pause at the bottom, and a 1-second explosive ascent. This nearly quadruples the muscular tension per repetition.</p>

      <h4>2. Modifying Mechanical Leverage</h4>
      <p>Elevating your feet on a chair during push-ups shifts load directly onto your clavicular head and anterior deltoids, increasing the percentage of bodyweight lifted from 64% to over 74%.</p>
    `,
    keyTakeaways: [
      'Focus on slow, controlled eccentric (lowering) phases.',
      'Shorten rest intervals to generate metabolic stress.',
      'Track your workouts consistently in NutriFit to verify progress over time.'
    ]
  },
  {
    id: 'art_3',
    title: 'Circadian Biology: How Light and Sleep Dictate Metabolism',
    category: 'sleep',
    readTime: '7 min read',
    author: 'Hazr Studios Clinical Science',
    date: 'Oct 2026',
    image: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=700&auto=format&fit=crop&q=80',
    excerpt: 'Morning sunlight exposure and evening blue light management calibrate cortisol rhythms, insulin sensitivity, and deep restorative sleep.',
    content: `
      <p>Every cell in your body contains an internal molecular clock governed by the suprachiasmatic nucleus (SCN) in the hypothalamus. These cellular clocks regulate enzymatic release, glucose clearance, and hormone synthesis based on environmental photic cues.</p>

      <h4>The 10-Minute Morning Sunlight Protocol</h4>
      <p>Viewing natural morning sunlight within 60 minutes of waking activates melanopsin-expressing retinal ganglion cells. This triggers a healthy morning cortisol surge, setting an internal timer for natural melatonin release approximately 14 to 16 hours later.</p>
    `,
    keyTakeaways: [
      'Get 10 minutes of outdoor sunlight in the morning without sunglasses.',
      'Keep dinner at least 2.5 to 3 hours prior to sleep for proper digestion.',
      'Maintain consistent wake times even on weekends.'
    ]
  },
  {
    id: 'art_4',
    title: 'The Habit Loop: Micro-Habits That Stick Forever',
    category: 'habits',
    readTime: '4 min read',
    author: 'Hazr Studios Lifestyle Lab',
    date: 'Oct 2026',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=700&auto=format&fit=crop&q=80',
    excerpt: 'Harness the power of habit stacking and friction reduction to automate your daily hydration, movement, and wellness rituals.',
    content: `
      <p>Willpower is an exhaustible cognitive resource. Sustainable wellness is never built through brute willpower alone—it is engineered by lowering the threshold of activation for desirable actions and increasing friction for unhelpful ones.</p>
      
      <h4>The Habit Stacking Framework</h4>
      <p>Pair an intended new micro-habit with an ingrained current anchor: "After I brew my morning espresso, I will immediately drink 500ml of water with a pinch of mineral salt."</p>
    `,
    keyTakeaways: [
      'Start so small it feels almost effortless (e.g. 2 minutes of stretching).',
      'Use the NutriFit Habit Tracker to celebrate visual momentum and streaks.',
      'Never miss twice—rebound immediately the next day.'
    ]
  }
];

const SEED_SUBSTITUTIONS = [
  { original: 'Sour Cream / Heavy Mayo', swap: 'Plain Greek Yogurt (0% or 2%)', benefit: 'Triples protein, eliminates saturated fat, adds gut-friendly probiotics' },
  { original: 'White Rice', swap: 'Tri-Color Quinoa or Riced Cauliflower', benefit: 'Adds complete amino acids, quadruples fiber, lowers glycemic index' },
  { original: 'Refined Vegetable Oil in Baking', swap: 'Unsweetened Applesauce or Mashed Banana', benefit: 'Drastically cuts refined seed oils while preserving moist texture' },
  { original: 'Heavy Cream in Soups', swap: 'Blended Silken Tofu or Pureed White Beans', benefit: 'Rich silky texture with plant protein, minerals, and zero cholesterol' },
  { original: 'Sugary Soda & Sweet Teas', swap: 'Sparkling Mineral Water with Fresh Lime & Mint', benefit: 'Zero refined sugars, zero artificial sweeteners, hydrating electrolytes' },
  { original: 'Croutons on Salads', swap: 'Toasted Pumpkin Seeds (Pepitas) or Walnuts', benefit: 'Replaces refined white flour with heart-healthy omega-3s and zinc' },
  { original: 'Butter for Toast Slices', swap: 'Mashed Hass Avocado with Lemon', benefit: 'Replaces animal fats with monounsaturated fatty acids and dietary potassium' },
  { original: 'Traditional Wheat Pasta', swap: 'Chickpea, Lentil, or Edamame Pasta', benefit: 'Delivers 25g protein per serving and double the dietary prebiotic fiber' }
];

const SEED_HABITS = [
  { id: 'hab_1', name: 'Drink 2,500ml Water', icon: '💧', category: 'hydration' },
  { id: 'hab_2', name: '30-Minute Movement or Walk', icon: '🏃', category: 'fitness' },
  { id: 'hab_3', name: '5 Servings Veggies & Fruits', icon: '🥗', category: 'nutrition' },
  { id: 'hab_4', name: '10-Minute Screen-Free Break', icon: '🧘', category: 'mindset' },
  { id: 'hab_5', name: '7.5+ Hours Quality Sleep', icon: '🌙', category: 'sleep' }
];

const SEED_BADGES = [
  { id: 'badge_water', name: 'Hydration Hero', icon: '💧', desc: 'Log at least 2,500ml water in a single day', requirement: 'water_2500' },
  { id: 'badge_habits', name: 'Routine Champion', icon: '✨', desc: 'Complete all daily habits in one day', requirement: 'all_habits' },
  { id: 'badge_streak', name: 'Streak Starter', icon: '🔥', desc: 'Maintain a 3-day continuous wellness streak', requirement: 'streak_3' },
  { id: 'badge_chef', name: 'Master Chef', icon: '🍳', desc: 'Save or create custom recipes in your library', requirement: 'recipe_action' },
  { id: 'badge_workout', name: 'Iron Will', icon: '🏋️', desc: 'Complete a guided workout timer session', requirement: 'workout_complete' },
  { id: 'badge_mealprep', name: 'Weekly Planner', icon: '📋', desc: 'Plan meals across your weekly calendar', requirement: 'meal_planned' }
];

// ============================================================================
// 3. APPLICATION STATE INITIALIZATION
// ============================================================================

let state = {
  theme: getData('theme', 'light'),
  user: getData('user', {
    name: 'Wellness Explorer',
    waterGoal: 2500,
    calorieTarget: 2000,
    dietary: 'none',
    allergies: '',
    fitnessLevel: 'intermediate',
    onboarded: false
  }),
  recipes: getData('recipes', SEED_RECIPES),
  workouts: getData('workouts', SEED_WORKOUTS),
  favorites: getData('favorites', []),
  workoutHistory: getData('workout_history', []),
  habitsList: getData('custom_habits', SEED_HABITS),
  dailyLogs: getData('daily_logs', {}), // keyed by 'YYYY-MM-DD'
  mealPlan: getData('meal_plan', {}),   // keyed by day string: 'monday', 'tuesday', etc.
  shoppingList: getData('shopping_list', []),
  unlockedBadges: getData('unlocked_badges', ['badge_water']),
  bookmarkedArticles: getData('bookmarked_articles', []),
  selectedPlannerDay: 'monday',
  guideHistory: getData('guide_history', []),
  recentlyViewedRecipes: getData('recently_viewed_recipes', []),
  recipeRatings: getData('recipe_ratings', {}),
  recipeNotes: getData('recipe_notes', {})
};

// Ensure active date log exists
const TODAY_STR = getLocalDateString();
if (!state.dailyLogs[TODAY_STR]) {
  state.dailyLogs[TODAY_STR] = {
    water: 0,
    completedHabits: [],
    activeMinutes: 0,
    caloriesBurned: 0,
    journal: null
  };
  setData('daily_logs', state.dailyLogs);
}

// ============================================================================
// 4. AUDIO CHIME SYNTHESIZER (Pure Web Audio API, Zero Audio Files Needed)
// ============================================================================

let audioCtx = null;

function playAudioChime(type = 'beep') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'complete') {
      // Pleasant two-tone chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    // Graceful fallback if autoplay restrictions prevent sound
  }
}

// ============================================================================
// 5. TOAST NOTIFICATIONS SYSTEM
// ============================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }, 3200);
}

// ============================================================================
// 6. THEME MANAGEMENT & ONBOARDING
// ============================================================================

function initTheme() {
  const currentTheme = state.theme;
  if (currentTheme === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  state.theme = next;
  setData('theme', next);
  showToast(`Switched to ${next} theme mode.`);
}

function checkOnboarding() {
  if (!state.user.onboarded) {
    openModal('onboarding-modal');
  }
}

function goToOnboardingStep(step) {
  document.querySelectorAll('.onboarding-step-pane').forEach(p => p.style.display = 'none');
  const targetPane = document.getElementById(`ob-pane-${step}`);
  if (targetPane) targetPane.style.display = 'block';

  document.querySelectorAll('.step-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === step - 1);
  });
}

function skipOnboarding() {
  state.user.onboarded = true;
  setData('user', state.user);
  closeModal('onboarding-modal');
  renderDashboard();
  showToast('Welcome to NutriFit! You can customize settings anytime.', 'info');
}

function finishOnboarding() {
  const name = document.getElementById('ob-name').value.trim() || 'Wellness Explorer';
  const dietary = document.getElementById('ob-dietary').value;
  const water = parseInt(document.getElementById('ob-water').value, 10) || 2500;
  const fitness = document.getElementById('ob-fitness').value;

  state.user.name = name;
  state.user.dietary = dietary;
  state.user.waterGoal = water;
  state.user.fitnessLevel = fitness;
  state.user.onboarded = true;
  setData('user', state.user);

  closeModal('onboarding-modal');
  renderDashboard();
  renderRecipes();
  renderWorkouts();
  showToast(`Welcome, ${name}! Your wellness blueprint is ready.`, 'success');
}

// ============================================================================
// 7. MODAL UTILITIES & NAVIGATION
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Global modal close handlers
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      // Don't auto-close onboarding on escape if not onboarded yet
      if (m.id === 'onboarding-modal' && !state.user.onboarded) return;
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      if (backdrop.id === 'onboarding-modal' && !state.user.onboarded) return;
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
});

// ============================================================================
// 8. DASHBOARD RENDERING & TRACKERS (Water, Habits, Trends Canvas)
// ============================================================================

function quickLogWater(deltaMl) {
  const today = state.dailyLogs[TODAY_STR];
  const newAmount = Math.max(0, (today.water || 0) + deltaMl);
  today.water = newAmount;
  setData('daily_logs', state.dailyLogs);

  renderWaterTracker();
  renderWeeklyChart();
  checkBadges();

  const msg = deltaMl > 0 ? `+${deltaMl}ml water logged!` : `${deltaMl}ml adjusted.`;
  showToast(msg, 'info');
}

function resetTodayWater() {
  state.dailyLogs[TODAY_STR].water = 0;
  setData('daily_logs', state.dailyLogs);
  renderWaterTracker();
  renderWeeklyChart();
  showToast('Today\'s water log reset.', 'info');
}

function renderWaterTracker() {
  const today = state.dailyLogs[TODAY_STR];
  const current = today.water || 0;
  const goal = state.user.waterGoal || 2500;
  const pct = Math.min(100, Math.round((current / goal) * 100));

  // Visual glass fill
  const fill = document.getElementById('water-glass-fill');
  if (fill) fill.style.height = `${pct}%`;

  const currText = document.getElementById('water-current-text');
  if (currText) currText.textContent = current.toLocaleString();

  const pctBadge = document.getElementById('water-percent-badge');
  if (pctBadge) pctBadge.textContent = `${pct}%`;

  const goalDisplay = document.getElementById('water-goal-display');
  if (goalDisplay) goalDisplay.textContent = `Goal: ${goal.toLocaleString()} ml`;

  // Hero Mini Snapshot
  const heroWaterVal = document.getElementById('hero-water-val');
  if (heroWaterVal) heroWaterVal.textContent = `${current} / ${goal} ml`;
  const heroWaterFill = document.getElementById('hero-water-fill');
  if (heroWaterFill) heroWaterFill.style.width = `${pct}%`;
}

function toggleHabit(habitId) {
  const today = state.dailyLogs[TODAY_STR];
  if (!today.completedHabits) today.completedHabits = [];

  const idx = today.completedHabits.indexOf(habitId);
  if (idx > -1) {
    today.completedHabits.splice(idx, 1);
  } else {
    today.completedHabits.push(habitId);
    playAudioChime('beep');
  }

  setData('daily_logs', state.dailyLogs);
  renderHabitsTracker();
  renderWeeklyChart();
  checkBadges();
}

function renderHabitsTracker() {
  const container = document.getElementById('dashboard-habits-list');
  if (!container) return;

  const today = state.dailyLogs[TODAY_STR];
  const completed = today.completedHabits || [];
  const habits = state.habitsList || [];

  container.innerHTML = '';
  habits.forEach(h => {
    const isDone = completed.includes(h.id);
    const item = document.createElement('div');
    item.className = `habit-item ${isDone ? 'done' : ''}`;
    item.innerHTML = `
      <input type="checkbox" id="chk_${h.id}" class="habit-checkbox" ${isDone ? 'checked' : ''}>
      <label for="chk_${h.id}" class="habit-label">${h.icon || '✨'} ${h.name}</label>
      <button class="btn-remove-meal" onclick="deleteCustomHabit('${h.id}')" title="Delete habit">&times;</button>
    `;
    const chk = item.querySelector('.habit-checkbox');
    chk.addEventListener('change', () => toggleHabit(h.id));
    container.appendChild(item);
  });

  // Score summary
  const scoreText = document.getElementById('habits-score-text');
  if (scoreText) scoreText.textContent = `${completed.length} of ${habits.length} Completed`;

  // Streak calculation
  const streak = calculateWellnessStreak();
  const streakTag = document.getElementById('habits-streak-tag');
  if (streakTag) streakTag.textContent = `🔥 ${streak}-Day Streak`;
  const heroStreak = document.getElementById('stat-streak-display');
  if (heroStreak) heroStreak.textContent = `${streak} Days`;

  // Hero habits bar
  const heroHabitsVal = document.getElementById('hero-habits-val');
  if (heroHabitsVal) heroHabitsVal.textContent = `${completed.length} / ${habits.length} Done`;
  const heroHabitsFill = document.getElementById('hero-habits-fill');
  if (heroHabitsFill) {
    const pct = habits.length > 0 ? (completed.length / habits.length) * 100 : 0;
    heroHabitsFill.style.width = `${pct}%`;
  }
}

function calculateWellnessStreak() {
  let streak = 0;
  const d = new Date();
  
  // Check consecutively backwards starting from today
  for (let i = 0; i < 60; i++) {
    const dateStr = getLocalDateString(d);
    const log = state.dailyLogs[dateStr];
    if (log && ((log.completedHabits && log.completedHabits.length > 0) || log.water > 0)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (i === 0) {
        // If today is not logged yet, test yesterday
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

function deleteCustomHabit(id) {
  state.habitsList = state.habitsList.filter(h => h.id !== id);
  setData('custom_habits', state.habitsList);
  renderHabitsTracker();
  showToast('Habit removed.', 'info');
}

// 7-Day HTML5 Canvas Trends Chart
function renderWeeklyChart() {
  const canvas = document.getElementById('weekly-trends-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Handle high-DPI retina display
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 240 * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 240;
  ctx.clearRect(0, 0, w, h);

  // Collect last 7 days data
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const log = state.dailyLogs[dateStr] || { water: 0, completedHabits: [] };
    const waterGoal = state.user.waterGoal || 2500;
    const waterPct = Math.min(100, (log.water / waterGoal) * 100);
    const habitPct = state.habitsList.length > 0 ? (log.completedHabits.length / state.habitsList.length) * 100 : 0;
    days.push({ dayName, waterPct, habitPct, isToday: i === 0 });
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // Draw grid lines
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 1;
  for (let y = 30; y <= h - 40; y += 40) {
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  // Draw Bar Chart per day
  const chartWidth = w - 60;
  const colWidth = chartWidth / days.length;
  const barWidth = 14;

  days.forEach((day, idx) => {
    const xCenter = 45 + idx * colWidth + colWidth / 2;
    const baseY = h - 40;

    // Day label
    ctx.fillStyle = day.isToday ? '#10b981' : textColor;
    ctx.font = day.isToday ? 'bold 12px sans-serif' : '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.dayName, xCenter, h - 15);

    // Water Bar
    const waterHeight = (day.waterPct / 100) * 130;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(xCenter - barWidth - 2, baseY - waterHeight, barWidth, waterHeight, [4, 4, 0, 0]);
    ctx.fill();

    // Habit Bar
    const habitHeight = (day.habitPct / 100) * 130;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(xCenter + 2, baseY - habitHeight, barWidth, habitHeight, [4, 4, 0, 0]);
    ctx.fill();
  });
}

function renderBadges() {
  const container = document.getElementById('badges-grid-container');
  if (!container) return;

  container.innerHTML = '';
  let unlockedCount = 0;

  SEED_BADGES.forEach(b => {
    const isUnlocked = state.unlockedBadges.includes(b.id);
    if (isUnlocked) unlockedCount++;

    const item = document.createElement('div');
    item.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
    item.title = `${b.name}: ${b.desc} (${isUnlocked ? 'Unlocked' : 'Locked'})`;
    item.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    `;
    container.appendChild(item);
  });

  const countPill = document.getElementById('unlocked-badge-count');
  if (countPill) countPill.textContent = `${unlockedCount} / ${SEED_BADGES.length}`;
}

function checkBadges() {
  const today = state.dailyLogs[TODAY_STR];
  const unlocked = new Set(state.unlockedBadges);

  // 1. Water check
  if (today.water >= 2500 && !unlocked.has('badge_water')) {
    unlocked.add('badge_water');
    showToast('🏆 Achievement Unlocked: Hydration Hero!', 'success');
  }

  // 2. All habits check
  if (today.completedHabits && today.completedHabits.length >= state.habitsList.length && state.habitsList.length > 0) {
    if (!unlocked.has('badge_habits')) {
      unlocked.add('badge_habits');
      showToast('🏆 Achievement Unlocked: Routine Champion!', 'success');
    }
  }

  // 3. Streak check
  if (calculateWellnessStreak() >= 3 && !unlocked.has('badge_streak')) {
    unlocked.add('badge_streak');
    showToast('🏆 Achievement Unlocked: Streak Starter!', 'success');
  }

  state.unlockedBadges = Array.from(unlocked);
  setData('unlocked_badges', state.unlockedBadges);
  renderBadges();
}

function renderDashboard() {
  // Greeting name & time
  const hour = new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) timeStr = 'Good afternoon';
  if (hour >= 17) timeStr = 'Good evening';

  const heroTime = document.getElementById('hero-greeting-time');
  if (heroTime) heroTime.textContent = timeStr;

  const heroName = document.getElementById('hero-greeting-name');
  if (heroName) heroName.textContent = state.user.name || 'Wellness Explorer';

  // Metrics
  const today = state.dailyLogs[TODAY_STR];
  const activeMinEl = document.getElementById('dash-active-minutes');
  if (activeMinEl) activeMinEl.textContent = today.activeMinutes || 0;

  const activeCalEl = document.getElementById('dash-active-calories');
  if (activeCalEl) activeCalEl.textContent = today.caloriesBurned || 0;

  const workoutsDoneEl = document.getElementById('dash-workouts-done');
  if (workoutsDoneEl) workoutsDoneEl.textContent = state.workoutHistory.length || 0;

  // Calorie & Macro Target Card
  renderMacroTargetCard();
  renderWaterTracker();
  renderHabitsTracker();
  renderBadges();
  renderWeeklyChart();
}

function renderMacroTargetCard() {
  const targetCals = state.user.calorieTarget || 2000;
  // Compute total planned calories for today from planner
  const todayMeals = state.mealPlan[state.selectedPlannerDay] || {};
  let totalCals = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
    (todayMeals[slot] || []).forEach(m => {
      totalCals += m.calories || 0;
      totalP += m.protein || 0;
      totalC += m.carbs || 0;
      totalF += m.fat || 0;
    });
  });

  const plannedCalEl = document.getElementById('planned-calories-text');
  if (plannedCalEl) plannedCalEl.textContent = `${totalCals} kcal`;

  const targetSub = document.getElementById('target-calories-sub');
  if (targetSub) targetSub.textContent = `/ ${targetCals} target`;

  // Target macro goals derived from calorie target
  const targetP = Math.round((targetCals * 0.3) / 4); // 30% protein
  const targetC = Math.round((targetCals * 0.4) / 4); // 40% carbs
  const targetF = Math.round((targetCals * 0.3) / 9); // 30% fat

  const pDisp = document.getElementById('macro-protein-display');
  if (pDisp) pDisp.textContent = `${totalP} / ${targetP}g`;
  const cDisp = document.getElementById('macro-carbs-display');
  if (cDisp) cDisp.textContent = `${totalC} / ${targetC}g`;
  const fDisp = document.getElementById('macro-fat-display');
  if (fDisp) fDisp.textContent = `${totalF} / ${targetF}g`;

  const barP = document.getElementById('bar-protein');
  if (barP) barP.style.width = `${Math.min(100, (totalP / targetP) * 100)}%`;
  const barC = document.getElementById('bar-carbs');
  if (barC) barC.style.width = `${Math.min(100, (totalC / targetC) * 100)}%`;
  const barF = document.getElementById('bar-fat');
  if (barF) barF.style.width = `${Math.min(100, (totalF / targetF) * 100)}%`;

  // Hero snapshot calories
  const heroCals = document.getElementById('hero-calories-val');
  if (heroCals) heroCals.textContent = `${totalCals} / ${targetCals} kcal`;
  const heroCalsFill = document.getElementById('hero-calories-fill');
  if (heroCalsFill) heroCalsFill.style.width = `${Math.min(100, (totalCals / targetCals) * 100)}%`;
}

// ============================================================================
// 9. RECIPE LIBRARY MODULE (Search, Filters, Servings Scaler, Ratings & Notes)
// ============================================================================

let currentRecipeFilter = 'all';
let currentRecipeSearch = '';
let currentRecipeTime = 'all';
let currentRecipeDiff = 'all';
let currentFridgeIngredients = [];
let activeRecipeModalData = null;
let activeRecipeServings = 2;

function renderRecipes() {
  const grid = document.getElementById('recipes-grid');
  const emptyState = document.getElementById('recipes-empty-state');
  if (!grid) return;

  const countPill = document.getElementById('fav-count-pill');
  if (countPill) countPill.textContent = state.favorites.length;

  const statCount = document.getElementById('stat-recipes-count');
  if (statCount) statCount.textContent = `${state.recipes.length}+`;

  let list = [...state.recipes];

  // Category / Tab filter
  if (currentRecipeFilter === 'favorites') {
    list = list.filter(r => state.favorites.includes(r.id));
  } else if (currentRecipeFilter !== 'all') {
    list = list.filter(r => {
      const catMatch = r.category && r.category.toLowerCase() === currentRecipeFilter.toLowerCase();
      const tagMatch = r.dietaryTags && r.dietaryTags.some(t => t.toLowerCase().replace(/[^a-z]/g, '') === currentRecipeFilter.toLowerCase().replace(/[^a-z]/g, ''));
      return catMatch || tagMatch;
    });
  }

  // Cooking Time Filter
  if (currentRecipeTime !== 'all') {
    list = list.filter(r => {
      if (currentRecipeTime === 'quick') return r.prepTime < 20;
      if (currentRecipeTime === 'medium') return r.prepTime >= 20 && r.prepTime <= 40;
      if (currentRecipeTime === 'long') return r.prepTime > 40;
      return true;
    });
  }

  // Difficulty Filter
  if (currentRecipeDiff !== 'all') {
    list = list.filter(r => (r.difficulty || 'easy').toLowerCase() === currentRecipeDiff.toLowerCase());
  }

  // Text search
  if (currentRecipeSearch.trim()) {
    const q = currentRecipeSearch.toLowerCase().trim();
    list = list.filter(r => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description && r.description.toLowerCase().includes(q);
      const matchIng = r.ingredients && r.ingredients.some(i => i.name.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchIng;
    });
  }

  // Fridge tags filter
  if (currentFridgeIngredients.length > 0) {
    list = list.filter(r => {
      return currentFridgeIngredients.some(tag => {
        return r.ingredients && r.ingredients.some(i => i.name.toLowerCase().includes(tag.toLowerCase()));
      });
    });
  }

  // Sorting
  const sortSelect = document.getElementById('recipe-sort-select');
  const sortVal = sortSelect ? sortSelect.value : 'recommended';
  if (sortVal === 'time-asc') {
    list.sort((a, b) => a.prepTime - b.prepTime);
  } else if (sortVal === 'protein-desc') {
    list.sort((a, b) => (b.protein || 0) - (a.protein || 0));
  } else if (sortVal === 'cal-asc') {
    list.sort((a, b) => a.calories - b.calories);
  }

  const resultsCount = document.getElementById('recipes-results-count');
  if (resultsCount) resultsCount.textContent = `Showing ${list.length} recipes`;

  if (list.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.innerHTML = '';

  list.forEach(recipe => {
    const isFav = state.favorites.includes(recipe.id);
    const rating = state.recipeRatings && state.recipeRatings[recipe.id] ? state.recipeRatings[recipe.id] : null;

    const card = document.createElement('div');
    card.className = 'recipe-card glass-card';
    card.innerHTML = `
      <div class="recipe-img-wrap">
        <img src="${recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'}" alt="${recipe.title}" class="recipe-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700';">
        <div class="recipe-badge-time">⏱️ ${recipe.prepTime} min</div>
        <button class="btn-fav-heart ${isFav ? 'active' : ''}" onclick="toggleFavoriteRecipe('${recipe.id}', event)" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="recipe-body">
        <div class="recipe-tags">
          ${(recipe.dietaryTags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}
          <span class="tag-badge text-muted">${(recipe.difficulty || 'Easy').toUpperCase()}</span>
          ${rating ? `<span class="tag-badge" style="background:#fef3c7; color:#b45309;">★ ${rating}/5</span>` : ''}
        </div>
        <h4 class="recipe-title">${recipe.title}</h4>
        <p class="recipe-summary">${recipe.description || 'Nutrient-rich balanced meal crafted for sustainable energy.'}</p>
        <div class="recipe-macros-bar">
          <span>🔥 <strong>${recipe.calories}</strong> kcal</span>
          <span>🍗 <strong>${recipe.protein || 0}g</strong> P</span>
          <span>🌾 <strong>${recipe.carbs || 0}g</strong> C</span>
          <span>🥑 <strong>${recipe.fat || 0}g</strong> F</span>
        </div>
        <div class="recipe-card-actions">
          <button class="btn btn-sm btn-primary" onclick="openRecipeDetailModal('${recipe.id}')">View Recipe</button>
          <button class="btn btn-sm btn-outline" onclick="openAddRecipeToPlannerModal('${recipe.id}')" title="Add to Meal Planner">Plan</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderRecentlyViewedRecipes() {
  const container = document.getElementById('recently-viewed-container');
  const listEl = document.getElementById('recently-viewed-list');
  if (!container || !listEl) return;

  const recents = state.recentlyViewedRecipes || [];
  if (recents.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  listEl.innerHTML = '';

  recents.forEach(id => {
    const r = state.recipes.find(item => item.id === id);
    if (!r) return;

    const chip = document.createElement('div');
    chip.className = 'recent-recipe-chip';
    chip.innerHTML = `
      <img src="${r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'}" alt="${r.title}">
      <span>${r.title}</span>
    `;
    chip.addEventListener('click', () => openRecipeDetailModal(r.id));
    listEl.appendChild(chip);
  });
}

function clearRecentlyViewedRecipes() {
  state.recentlyViewedRecipes = [];
  setData('recently_viewed_recipes', state.recentlyViewedRecipes);
  renderRecentlyViewedRecipes();
  showToast('Cleared recently viewed recipes.', 'info');
}

function toggleFavoriteRecipe(id, event) {
  if (event) event.stopPropagation();
  const idx = state.favorites.indexOf(id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast('Removed from favorites.');
  } else {
    state.favorites.push(id);
    showToast('Saved to your favorites! ❤️', 'success');
  }
  setData('favorites', state.favorites);
  renderRecipes();
}

function openRecipeDetailModal(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  activeRecipeModalData = recipe;
  activeRecipeServings = recipe.servings || 2;

  // Track recently viewed
  if (!state.recentlyViewedRecipes) state.recentlyViewedRecipes = [];
  state.recentlyViewedRecipes = state.recentlyViewedRecipes.filter(id => id !== recipeId);
  state.recentlyViewedRecipes.unshift(recipeId);
  if (state.recentlyViewedRecipes.length > 8) {
    state.recentlyViewedRecipes = state.recentlyViewedRecipes.slice(0, 8);
  }
  setData('recently_viewed_recipes', state.recentlyViewedRecipes);
  renderRecentlyViewedRecipes();

  renderRecipeModalContent();
  openModal('recipe-modal');
}

function renderRecipeModalContent() {
  const container = document.getElementById('recipe-modal-content');
  if (!container || !activeRecipeModalData) return;

  const r = activeRecipeModalData;
  const ratio = activeRecipeServings / (r.servings || 2);

  const scaledCalories = Math.round(r.calories * ratio);
  const scaledProtein = Math.round((r.protein || 0) * ratio);
  const scaledCarbs = Math.round((r.carbs || 0) * ratio);
  const scaledFat = Math.round((r.fat || 0) * ratio);

  const currentRating = state.recipeRatings && state.recipeRatings[r.id] ? state.recipeRatings[r.id] : 0;
  const currentNote = state.recipeNotes && state.recipeNotes[r.id] ? state.recipeNotes[r.id] : '';

  container.innerHTML = `
    <div class="recipe-modal-grid">
      <div class="recipe-modal-image-col">
        <img src="${r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'}" alt="${r.title}" class="modal-recipe-img" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700';">
        
        <!-- Servings Scaler Widget -->
        <div class="servings-scaler-box">
          <div>
            <strong>Adjust Servings:</strong>
            <div class="text-xs text-muted">Scales ingredients & macros in real time</div>
          </div>
          <div class="servings-control">
            <button onclick="scaleRecipeServings(-1)" title="Decrease servings">-</button>
            <span class="font-medium text-main" id="modal-servings-val">${activeRecipeServings}</span>
            <button onclick="scaleRecipeServings(1)" title="Increase servings">+</button>
          </div>
        </div>

        <div class="modal-macros-grid">
          <div class="modal-macro-tile">
            <span>Calories</span>
            <strong>${scaledCalories} kcal</strong>
          </div>
          <div class="modal-macro-tile">
            <span>Protein</span>
            <strong>${scaledProtein}g</strong>
          </div>
          <div class="modal-macro-tile">
            <span>Carbs</span>
            <strong>${scaledCarbs}g</strong>
          </div>
          <div class="modal-macro-tile">
            <span>Fats</span>
            <strong>${scaledFat}g</strong>
          </div>
        </div>

        <!-- Interactive Cook's Rating & Personal Notes Widget -->
        <div class="recipe-interactive-actions">
          <div class="recipe-rating-widget">
            <span class="text-xs font-medium">My Personal Rating:</span>
            <div class="stars-row" title="Click to rate recipe">
              ${[1, 2, 3, 4, 5].map(star => `
                <span class="star-btn ${star <= currentRating ? 'rated' : ''}" onclick="setRecipeRating('${r.id}', ${star})" title="Rate ${star} star${star > 1 ? 's' : ''}">★</span>
              `).join('')}
            </div>
          </div>

          <div class="cooks-notes-box">
            <label for="cooks-note-input" class="text-xs font-medium text-muted">My Cook's Personal Note:</label>
            <textarea id="cooks-note-input" class="cooks-notes-textarea" rows="2" placeholder="e.g. Added extra fresh dill, grilled for 4 mins...">${currentNote}</textarea>
            <button class="btn btn-sm btn-outline mt-1" onclick="saveRecipeCooksNote('${r.id}')">💾 Save Note</button>
          </div>
        </div>

        <div class="modal-actions-col mt-2">
          <button class="btn btn-primary btn-full mb-2" onclick="addRecipeIngredientsToShoppingList()">
            🛒 Add Ingredients to Shopping List
          </button>
          <button class="btn btn-outline btn-full" onclick="openAddRecipeToPlannerModal('${r.id}')">
            📋 Add to Today's Meal Plan
          </button>
        </div>

        ${r.allergyNotes ? `
          <div class="disclaimer-note mt-2">
            <span class="note-icon">⚠️</span>
            <p><strong>Allergy Advice:</strong> ${r.allergyNotes}</p>
          </div>
        ` : ''}
      </div>

      <div class="recipe-modal-info-col">
        <div class="recipe-tags mb-2">
          ${(r.dietaryTags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}
          <span class="tag-badge text-muted">${(r.difficulty || 'Easy').toUpperCase()}</span>
          <span class="tag-badge text-muted">⏱️ ${r.prepTime} MINS</span>
        </div>
        <h2 id="recipe-modal-title">${r.title}</h2>
        <p class="text-muted text-sm mb-3">${r.description || ''}</p>

        <h4>Ingredients (${activeRecipeServings} servings)</h4>
        <div class="ingredients-checklist">
          ${(r.ingredients || []).map((ing, i) => {
            const scaledAmt = ing.amount ? +(ing.amount * ratio).toFixed(1) : '';
            return `
              <label class="ing-check-item">
                <input type="checkbox">
                <span><strong>${scaledAmt} ${ing.unit || ''}</strong> ${ing.name}</span>
              </label>
            `;
          }).join('')}
        </div>

        <h4 class="mt-3">Preparation Instructions</h4>
        <div class="steps-list">
          ${(r.instructions || []).map((step, idx) => `
            <div class="step-item">
              <span class="step-num">${idx + 1}</span>
              <p>${step}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function setRecipeRating(recipeId, stars) {
  if (!state.recipeRatings) state.recipeRatings = {};
  state.recipeRatings[recipeId] = stars;
  setData('recipe_ratings', state.recipeRatings);
  renderRecipeModalContent();
  renderRecipes();
  showToast(`Rated recipe ${stars} star${stars > 1 ? 's' : ''}! ⭐`, 'success');
}

function saveRecipeCooksNote(recipeId) {
  const noteEl = document.getElementById('cooks-note-input');
  if (!noteEl) return;
  const val = noteEl.value.trim();
  if (!state.recipeNotes) state.recipeNotes = {};
  state.recipeNotes[recipeId] = val;
  setData('recipe_notes', state.recipeNotes);
  showToast('Cook\'s personal note saved! 📝', 'success');
}

function scaleRecipeServings(delta) {
  activeRecipeServings = Math.max(1, Math.min(20, activeRecipeServings + delta));
  renderRecipeModalContent();
}

function openRandomRecipeModal() {
  if (!state.recipes.length) return;
  const rand = state.recipes[Math.floor(Math.random() * state.recipes.length)];
  openRecipeDetailModal(rand.id);
  showToast('🎲 Random recipe selected!', 'info');
}

function addRecipeIngredientsToShoppingList() {
  if (!activeRecipeModalData) return;
  const ratio = activeRecipeServings / (activeRecipeModalData.servings || 2);

  activeRecipeModalData.ingredients.forEach(ing => {
    const scaledAmt = ing.amount ? +(ing.amount * ratio).toFixed(1) : '';
    const qtyStr = scaledAmt ? `${scaledAmt} ${ing.unit || ''}`.trim() : '';

    state.shoppingList.push({
      id: 'shop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: ing.name,
      qty: qtyStr,
      category: categorizeIngredient(ing.name),
      checked: false
    });
  });

  setData('shopping_list', state.shoppingList);
  renderShoppingList();
  showToast(`Added ${activeRecipeModalData.ingredients.length} ingredients to your shopping list! 🛒`, 'success');
}

function categorizeIngredient(name) {
  const n = name.toLowerCase();
  if (n.includes('spinach') || n.includes('avocado') || n.includes('lemon') || n.includes('lime') || n.includes('tomato') || n.includes('cucumber') || n.includes('blueberry') || n.includes('banana') || n.includes('asparagus') || n.includes('kale')) {
    return 'Produce';
  }
  if (n.includes('salmon') || n.includes('chicken') || n.includes('egg') || n.includes('yogurt') || n.includes('feta') || n.includes('milk') || n.includes('protein')) {
    return 'Protein & Dairy';
  }
  if (n.includes('quinoa') || n.includes('oats') || n.includes('bread') || n.includes('chickpea') || n.includes('lentil') || n.includes('rice')) {
    return 'Pantry & Grains';
  }
  if (n.includes('oil') || n.includes('salt') || n.includes('turmeric') || n.includes('cinnamon') || n.includes('thyme') || n.includes('pepper') || n.includes('dill')) {
    return 'Spices & Oils';
  }
  return 'Other';
}

// Fridge Matcher Setup
const POPULAR_FRIDGE_ITEMS = [
  'Avocado', 'Eggs', 'Chicken', 'Salmon', 'Spinach', 'Quinoa', 'Greek Yogurt', 
  'Blueberries', 'Oats', 'Lentils', 'Almond Milk', 'Feta', 'Chia Seeds', 'Cucumber'
];

function initFridgeMatcher() {
  const container = document.getElementById('fridge-ingredients-list');
  if (!container) return;
  container.innerHTML = '';

  POPULAR_FRIDGE_ITEMS.forEach(item => {
    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = 'fridge-tag';
    tag.textContent = item;
    tag.addEventListener('click', () => {
      const idx = currentFridgeIngredients.indexOf(item);
      if (idx > -1) {
        currentFridgeIngredients.splice(idx, 1);
        tag.classList.remove('selected');
      } else {
        currentFridgeIngredients.push(item);
        tag.classList.add('selected');
      }
      const statusEl = document.getElementById('fridge-match-status');
      if (statusEl) statusEl.textContent = `${currentFridgeIngredients.length} ingredients selected`;
      renderRecipes();
    });
    container.appendChild(tag);
  });
}

// ============================================================================
// 10. WORKOUT MODULE & GUIDED INTERVAL TIMER
// ============================================================================

let currentWorkoutFilter = 'all';
let currentWorkoutDiff = 'all';
let currentWorkoutSearch = '';

// Active Timer State
let activeWorkoutSession = null;
let workoutTimerInterval = null;
let timerSecondsRemaining = 0;
let isTimerPaused = false;
let currentExerciseIndex = 0;

function renderWorkouts() {
  const grid = document.getElementById('workouts-grid');
  const emptyState = document.getElementById('workouts-empty-state');
  if (!grid) return;

  const statCount = document.getElementById('stat-workouts-count');
  if (statCount) statCount.textContent = `${state.workouts.length}+`;

  const historyCount = document.getElementById('history-count-badge');
  if (historyCount) historyCount.textContent = state.workoutHistory.length;

  let list = [...state.workouts];

  // Category filter
  if (currentWorkoutFilter !== 'all') {
    list = list.filter(w => {
      if (currentWorkoutFilter === 'quick') return w.durationMinutes <= 20;
      return w.category && w.category.toLowerCase() === currentWorkoutFilter.toLowerCase();
    });
  }

  // Difficulty filter
  if (currentWorkoutDiff !== 'all') {
    list = list.filter(w => w.difficulty.toLowerCase() === currentWorkoutDiff.toLowerCase());
  }

  // Search filter
  if (currentWorkoutSearch.trim()) {
    const q = currentWorkoutSearch.toLowerCase().trim();
    list = list.filter(w => {
      const titleM = w.title.toLowerCase().includes(q);
      const focusM = w.focus && w.focus.toLowerCase().includes(q);
      const equipM = w.equipment && w.equipment.toLowerCase().includes(q);
      return titleM || focusM || equipM;
    });
  }

  if (list.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.innerHTML = '';

  list.forEach(w => {
    const card = document.createElement('div');
    card.className = 'workout-card glass-card';
    card.innerHTML = `
      <div>
        <div class="workout-card-top">
          <span class="card-badge workout-badge">${w.category.toUpperCase()}</span>
          <span class="difficulty-tag diff-${w.difficulty}">${w.difficulty}</span>
        </div>
        <h3 class="recipe-title">${w.title}</h3>
        <div class="workout-meta-chips">
          <span>⏱️ ${w.durationMinutes} mins</span>
          <span>🔥 ~${w.caloriesBurned} kcal</span>
          <span>🏋️ ${w.equipment || 'Bodyweight'}</span>
        </div>
        <p class="text-sm text-muted mb-2">${w.focus || 'Targeted functional conditioning'}</p>
        <div class="workout-exercises-preview">
          <strong>Routine Includes (${(w.exercises || []).length} Movements):</strong>
          ${(w.exercises || []).slice(0, 3).map(e => `• ${e.name}`).join('<br>')}
          ${(w.exercises || []).length > 3 ? `<br><small class="text-muted">+ ${(w.exercises || []).length - 3} more...</small>` : ''}
        </div>
      </div>
      <div class="workout-card-footer">
        <button class="btn btn-primary btn-sm" onclick="startWorkoutSession('${w.id}')">Start Timer ⏱️</button>
        <button class="btn btn-outline btn-sm" onclick="openWorkoutDetailsModal('${w.id}')">Details</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function startWorkoutSession(workoutId) {
  const w = state.workouts.find(item => item.id === workoutId);
  if (!w) return;

  activeWorkoutSession = { ...w };
  currentExerciseIndex = 0;
  isTimerPaused = false;

  renderWorkoutTimerModal();
  openModal('workout-modal');
  startCurrentExerciseTimer();
}

function openWorkoutDetailsModal(workoutId) {
  const w = state.workouts.find(item => item.id === workoutId);
  if (!w) return;

  const container = document.getElementById('workout-modal-content');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-header">
      <span class="difficulty-tag diff-${w.difficulty} mb-2">${w.difficulty.toUpperCase()}</span>
      <h2>${w.title}</h2>
      <div class="workout-meta-chips">
        <span>⏱️ ${w.durationMinutes} minutes</span>
        <span>🔥 ~${w.caloriesBurned} kcal burn</span>
        <span>🏋️ Equipment: ${w.equipment || 'None'}</span>
      </div>
    </div>
    
    <h4>Target Focus & Instructions</h4>
    <p class="text-sm text-secondary mb-3">${w.instructions || 'Follow proper posture throughout all exercises.'}</p>

    <h4>Exercise Breakdown (${(w.exercises || []).length} Movements)</h4>
    <div class="steps-list">
      ${(w.exercises || []).map((ex, i) => `
        <div class="step-item">
          <span class="step-num">${i + 1}</span>
          <div>
            <strong>${ex.name}</strong>
            <div class="text-xs text-muted">Duration: ${ex.durationSec || 45}s | Rest: ${ex.restSec || 15}s</div>
          </div>
        </div>
      `).join('')}
    </div>

    ${w.safetyTips ? `
      <div class="disclaimer-note mt-3">
        <span class="note-icon">🛡️</span>
        <p><strong>Safety Advice:</strong> ${w.safetyTips}</p>
      </div>
    ` : ''}

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal('workout-modal')">Close</button>
      <button class="btn btn-primary" onclick="startWorkoutSession('${w.id}')">Launch Interactive Timer ⏱️</button>
    </div>
  `;
  openModal('workout-modal');
}

function renderWorkoutTimerModal() {
  const container = document.getElementById('workout-modal-content');
  if (!container || !activeWorkoutSession) return;

  const exercises = activeWorkoutSession.exercises || [];
  const currentEx = exercises[currentExerciseIndex] || { name: 'Complete', durationSec: 0 };
  const totalExercises = exercises.length;

  container.innerHTML = `
    <div class="modal-header text-center">
      <span class="card-badge workout-badge">Exercise ${currentExerciseIndex + 1} of ${totalExercises}</span>
      <h3 class="mt-2">${activeWorkoutSession.title}</h3>
    </div>

    <div class="timer-hero-display">
      <div class="timer-circle-wrap">
        <svg class="timer-svg" viewBox="0 0 100 100">
          <circle class="timer-circle-bg" cx="50" cy="50" r="42"></circle>
          <circle class="timer-circle-progress" id="timer-progress-ring" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="0"></circle>
        </svg>
        <div class="timer-time-text">
          <div class="timer-clock" id="timer-clock-display">00:45</div>
          <div class="timer-status-label" id="timer-status-label">Work</div>
        </div>
      </div>
    </div>

    <div class="current-exercise-banner">
      <h4 id="timer-exercise-name">${currentEx.name}</h4>
      <p id="timer-exercise-next">${currentExerciseIndex + 1 < totalExercises ? `Next: ${exercises[currentExerciseIndex + 1].name}` : 'Final Exercise!'}</p>
    </div>

    <div class="timer-controls-row">
      <button class="btn btn-outline" onclick="skipPreviousExercise()" ${currentExerciseIndex === 0 ? 'disabled' : ''}>⏮️ Prev</button>
      <button class="btn btn-primary btn-lg" id="timer-pause-btn" onclick="toggleTimerPause()">⏸️ Pause</button>
      <button class="btn btn-outline" onclick="skipNextExercise()">Next ⏭️</button>
      <button class="btn btn-ghost text-danger" onclick="stopWorkoutSession()">Stop</button>
    </div>
  `;
}

function startCurrentExerciseTimer() {
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  if (!activeWorkoutSession) return;

  const exercises = activeWorkoutSession.exercises || [];
  if (currentExerciseIndex >= exercises.length) {
    finishWorkoutSession();
    return;
  }

  const currentEx = exercises[currentExerciseIndex];
  timerSecondsRemaining = currentEx.durationSec || 45;
  const initialDuration = timerSecondsRemaining;

  updateTimerDisplay(timerSecondsRemaining, initialDuration);

  workoutTimerInterval = setInterval(() => {
    if (isTimerPaused) return;

    timerSecondsRemaining--;
    updateTimerDisplay(timerSecondsRemaining, initialDuration);

    // Beep in last 3 seconds
    if (timerSecondsRemaining <= 3 && timerSecondsRemaining > 0) {
      playAudioChime('beep');
    }

    if (timerSecondsRemaining <= 0) {
      clearInterval(workoutTimerInterval);
      playAudioChime('beep');
      currentExerciseIndex++;
      if (currentExerciseIndex < exercises.length) {
        renderWorkoutTimerModal();
        startCurrentExerciseTimer();
      } else {
        finishWorkoutSession();
      }
    }
  }, 1000);
}

function updateTimerDisplay(remainingSec, totalSec) {
  const clock = document.getElementById('timer-clock-display');
  if (clock) {
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    clock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const ring = document.getElementById('timer-progress-ring');
  if (ring && totalSec > 0) {
    const circumference = 264; // 2 * pi * 42
    const fraction = remainingSec / totalSec;
    const offset = circumference * (1 - fraction);
    ring.style.strokeDashoffset = offset;
  }
}

function toggleTimerPause() {
  isTimerPaused = !isTimerPaused;
  const btn = document.getElementById('timer-pause-btn');
  const label = document.getElementById('timer-status-label');
  if (btn) {
    btn.textContent = isTimerPaused ? '▶️ Resume' : '⏸️ Pause';
  }
  if (label) {
    label.textContent = isTimerPaused ? 'Paused' : 'Work';
  }
}

function skipNextExercise() {
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  currentExerciseIndex++;
  renderWorkoutTimerModal();
  startCurrentExerciseTimer();
}

function skipPreviousExercise() {
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  currentExerciseIndex = Math.max(0, currentExerciseIndex - 1);
  renderWorkoutTimerModal();
  startCurrentExerciseTimer();
}

function stopWorkoutSession() {
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  activeWorkoutSession = null;
  closeModal('workout-modal');
  showToast('Workout timer stopped.', 'info');
}

function finishWorkoutSession() {
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  playAudioChime('complete');

  const sessionRecord = {
    id: 'wo_hist_' + Date.now(),
    title: activeWorkoutSession.title,
    durationMinutes: activeWorkoutSession.durationMinutes || 20,
    caloriesBurned: activeWorkoutSession.caloriesBurned || 150,
    completedAt: new Date().toISOString(),
    dateStr: TODAY_STR
  };

  state.workoutHistory.unshift(sessionRecord);
  setData('workout_history', state.workoutHistory);

  // Update today's dashboard active minutes and calories
  const today = state.dailyLogs[TODAY_STR];
  today.activeMinutes = (today.activeMinutes || 0) + sessionRecord.durationMinutes;
  today.caloriesBurned = (today.caloriesBurned || 0) + sessionRecord.caloriesBurned;
  setData('daily_logs', state.dailyLogs);

  activeWorkoutSession = null;
  closeModal('workout-modal');

  renderDashboard();
  renderWorkouts();
  checkBadges();
  showToast(`🎉 Workout Complete! +${sessionRecord.caloriesBurned} kcal burned!`, 'success');
}

function renderWorkoutHistory() {
  const container = document.getElementById('workout-history-container');
  if (!container) return;

  if (state.workoutHistory.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-icon">🏋️</div>
        <h4>No completed workouts yet</h4>
        <p class="text-muted">Start any routine using the interactive timer to track your history.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  state.workoutHistory.forEach(record => {
    const item = document.createElement('div');
    item.className = 'slot-meal-item mb-2';
    const dateFormatted = new Date(record.completedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    item.innerHTML = `
      <div class="meal-item-header">
        <strong class="meal-item-title">${record.title}</strong>
        <span class="text-xs text-muted">${dateFormatted}</span>
      </div>
      <div class="meal-item-meta">
        <span>⏱️ ${record.durationMinutes} mins</span>
        <span>🔥 ${record.caloriesBurned} kcal</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// ============================================================================
// 11. WEEKLY MEAL PLANNER & SMART SHOPPING LIST
// ============================================================================

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' }
];

let activeAddMealSlot = 'breakfast';

function initMealPlanner() {
  renderPlannerDayPills();
  renderMealSlots();
  renderShoppingList();
}

function renderPlannerDayPills() {
  const container = document.getElementById('planner-day-pills');
  if (!container) return;

  container.innerHTML = '';
  DAYS_OF_WEEK.forEach(day => {
    const pill = document.createElement('div');
    pill.className = `day-pill ${state.selectedPlannerDay === day.id ? 'active' : ''}`;
    pill.innerHTML = `
      <span class="day-name">${day.label}</span>
      <span class="day-date">${day.id.slice(0, 3)}</span>
    `;
    pill.addEventListener('click', () => {
      state.selectedPlannerDay = day.id;
      renderPlannerDayPills();
      renderMealSlots();
      renderMacroTargetCard();
    });
    container.appendChild(pill);
  });
}

function renderMealSlots() {
  const dayData = state.mealPlan[state.selectedPlannerDay] || {};
  let totalCals = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
    const listContainer = document.getElementById(`slot-items-${slot}`);
    if (!listContainer) return;

    const meals = dayData[slot] || [];
    if (meals.length === 0) {
      listContainer.innerHTML = `<div class="slot-empty">No ${slot} planned yet.</div>`;
    } else {
      listContainer.innerHTML = '';
      meals.forEach((m, idx) => {
        totalCals += m.calories || 0;
        totalP += m.protein || 0;
        totalC += m.carbs || 0;
        totalF += m.fat || 0;

        const el = document.createElement('div');
        el.className = 'slot-meal-item';
        el.innerHTML = `
          <div class="meal-item-header">
            <span class="meal-item-title">${m.name}</span>
            <button class="btn-remove-meal" onclick="removeMealFromPlan('${slot}', ${idx})" title="Remove meal">&times;</button>
          </div>
          <div class="meal-item-meta">
            <span>🔥 ${m.calories} kcal</span>
            <span>P: ${m.protein || 0}g | C: ${m.carbs || 0}g | F: ${m.fat || 0}g</span>
          </div>
        `;
        listContainer.appendChild(el);
      });
    }
  });

  // Day total metrics
  const calsEl = document.getElementById('day-total-cals');
  if (calsEl) calsEl.textContent = `${totalCals} kcal`;
  const macroEl = document.getElementById('day-total-macros');
  if (macroEl) macroEl.textContent = `P: ${totalP}g | C: ${totalC}g | F: ${totalF}g`;
}

function openAddMealModal(slot) {
  activeAddMealSlot = slot;
  const desc = document.getElementById('add-meal-slot-desc');
  if (desc) desc.textContent = `Assign a meal to ${state.selectedPlannerDay.toUpperCase()} ${slot.toUpperCase()}`;
  renderPlannerRecipePicker();
  openModal('add-meal-modal');
}

function renderPlannerRecipePicker(searchQuery = '') {
  const listEl = document.getElementById('planner-recipe-picker-list');
  if (!listEl) return;

  let list = [...state.recipes];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }

  listEl.innerHTML = '';
  list.forEach(r => {
    const item = document.createElement('div');
    item.className = 'shopping-item-row mb-2';
    item.innerHTML = `
      <div>
        <strong>${r.title}</strong>
        <div class="text-xs text-muted">🔥 ${r.calories} kcal • P: ${r.protein || 0}g • C: ${r.carbs || 0}g</div>
      </div>
      <button class="btn btn-sm btn-primary" onclick="addRecipeToPlan('${r.id}')">+ Add</button>
    `;
    listEl.appendChild(item);
  });
}

function addRecipeToPlan(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  if (!state.mealPlan[state.selectedPlannerDay]) {
    state.mealPlan[state.selectedPlannerDay] = {};
  }
  if (!state.mealPlan[state.selectedPlannerDay][activeAddMealSlot]) {
    state.mealPlan[state.selectedPlannerDay][activeAddMealSlot] = [];
  }

  state.mealPlan[state.selectedPlannerDay][activeAddMealSlot].push({
    recipeId: recipe.id,
    name: recipe.title,
    calories: recipe.calories,
    protein: recipe.protein || 0,
    carbs: recipe.carbs || 0,
    fat: recipe.fat || 0
  });

  setData('meal_plan', state.mealPlan);
  closeModal('add-meal-modal');
  renderMealSlots();
  renderMacroTargetCard();
  checkBadges();
  showToast(`Added ${recipe.title} to ${activeAddMealSlot}!`, 'success');
}

function removeMealFromPlan(slot, index) {
  if (state.mealPlan[state.selectedPlannerDay] && state.mealPlan[state.selectedPlannerDay][slot]) {
    state.mealPlan[state.selectedPlannerDay][slot].splice(index, 1);
    setData('meal_plan', state.mealPlan);
    renderMealSlots();
    renderMacroTargetCard();
    showToast('Meal removed from plan.', 'info');
  }
}

function duplicateCurrentDayPlan(targetDay) {
  if (!state.mealPlan[state.selectedPlannerDay]) {
    showToast('No meals on current day to copy.', 'error');
    return;
  }
  state.mealPlan[targetDay] = JSON.parse(JSON.stringify(state.mealPlan[state.selectedPlannerDay]));
  setData('meal_plan', state.mealPlan);
  closeModal('duplicate-day-modal');
  renderMealSlots();
  showToast(`Copied ${state.selectedPlannerDay} plan to ${targetDay}!`, 'success');
}

function openAddRecipeToPlannerModal(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  activeAddMealSlot = recipe.category || 'lunch';
  addRecipeToPlan(recipe.id);
}

// Smart Shopping List Auto-Generator
function generateShoppingListFromPlan() {
  let count = 0;
  const ingredientMap = new Map();

  DAYS_OF_WEEK.forEach(day => {
    const dayData = state.mealPlan[day.id] || {};
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
      (dayData[slot] || []).forEach(meal => {
        if (meal.recipeId) {
          const fullRecipe = state.recipes.find(r => r.id === meal.recipeId);
          if (fullRecipe && fullRecipe.ingredients) {
            fullRecipe.ingredients.forEach(ing => {
              const key = ing.name.toLowerCase().trim();
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                existing.amount = (existing.amount || 0) + (ing.amount || 0);
              } else {
                ingredientMap.set(key, {
                  name: ing.name,
                  amount: ing.amount || null,
                  unit: ing.unit || '',
                  category: categorizeIngredient(ing.name)
                });
              }
            });
          }
        }
      });
    });
  });

  if (ingredientMap.size === 0) {
    showToast('No planned recipes with ingredients found. Plan some meals first!', 'error');
    return;
  }

  ingredientMap.forEach(val => {
    state.shoppingList.push({
      id: 'shop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: val.name,
      qty: val.amount ? `${+val.amount.toFixed(1)} ${val.unit}`.trim() : '',
      category: val.category,
      checked: false
    });
    count++;
  });

  setData('shopping_list', state.shoppingList);
  renderShoppingList();
  showToast(`Generated ${count} grocery items from your meal plan! 🛒`, 'success');

  // Switch tab to shopping list view
  document.getElementById('tab-btn-shopping').click();
}

function renderShoppingList() {
  const container = document.getElementById('shopping-categories-container');
  const emptyState = document.getElementById('shopping-empty-state');
  const countBadge = document.getElementById('shopping-item-count');
  if (!container) return;

  const activeCount = state.shoppingList.filter(item => !item.checked).length;
  if (countBadge) countBadge.textContent = activeCount;

  if (state.shoppingList.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.innerHTML = '';

  const categories = ['Produce', 'Protein & Dairy', 'Pantry & Grains', 'Spices & Oils', 'Other'];

  categories.forEach(cat => {
    const itemsInCat = state.shoppingList.filter(item => (item.category || 'Other') === cat);
    if (itemsInCat.length === 0) return;

    const group = document.createElement('div');
    group.className = 'shopping-category-group';
    group.innerHTML = `
      <div class="shopping-category-header">
        <span>${cat}</span>
        <span class="text-xs text-muted">${itemsInCat.length} items</span>
      </div>
      <div class="shopping-items-list">
        ${itemsInCat.map(item => `
          <div class="shopping-item-row ${item.checked ? 'checked' : ''}" id="row_${item.id}">
            <div class="shopping-item-left">
              <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleShoppingItem('${item.id}')">
              <span class="shopping-item-name">${item.name}</span>
            </div>
            ${item.qty ? `<span class="shopping-item-qty">${item.qty}</span>` : ''}
            <button class="btn-remove-shop-item" onclick="removeShoppingItem('${item.id}')" title="Delete item">&times;</button>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(group);
  });
}

function toggleShoppingItem(id) {
  const item = state.shoppingList.find(i => i.id === id);
  if (item) {
    item.checked = !item.checked;
    setData('shopping_list', state.shoppingList);
    renderShoppingList();
  }
}

function removeShoppingItem(id) {
  state.shoppingList = state.shoppingList.filter(i => i.id !== id);
  setData('shopping_list', state.shoppingList);
  renderShoppingList();
  showToast('Item removed.', 'info');
}

function clearCheckedShoppingItems() {
  state.shoppingList = state.shoppingList.filter(i => !i.checked);
  setData('shopping_list', state.shoppingList);
  renderShoppingList();
  showToast('Cleared purchased items.', 'info');
}

function clearAllShoppingItems() {
  state.shoppingList = [];
  setData('shopping_list', state.shoppingList);
  renderShoppingList();
  showToast('Shopping list cleared.', 'info');
}

// ============================================================================
// 12. NUTRITION GUIDES & BMR/TDEE MACRO CALCULATOR
// ============================================================================

function calculateNutritionNeeds(e) {
  if (e) e.preventDefault();

  const gender = document.getElementById('calc-gender').value;
  const age = parseFloat(document.getElementById('calc-age').value) || 28;
  const weight = parseFloat(document.getElementById('calc-weight').value) || 68;
  const height = parseFloat(document.getElementById('calc-height').value) || 168;
  const activity = parseFloat(document.getElementById('calc-activity').value) || 1.375;
  const goal = document.getElementById('calc-goal').value;

  // Mifflin-St Jeor Formula
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  const tdee = Math.round(bmr * activity);
  let targetCalories = tdee;

  if (goal === 'deficit') {
    targetCalories = Math.round(tdee * 0.85); // -15% sustainable deficit
  } else if (goal === 'surplus') {
    targetCalories = Math.round(tdee * 1.10); // +10% lean surplus
  }

  // Macro Splits (30% Protein, 40% Carbs, 30% Fat)
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.3) / 9);

  // Baseline water target in ml (approx 35ml per kg)
  const waterTarget = Math.round(weight * 35);

  // Render results
  document.getElementById('res-bmr').textContent = `${bmr.toLocaleString()} kcal`;
  document.getElementById('res-tdee').textContent = `${targetCalories.toLocaleString()} kcal`;
  document.getElementById('res-protein').textContent = `${proteinGrams}g`;
  document.getElementById('res-carbs').textContent = `${carbsGrams}g`;
  document.getElementById('res-fat').textContent = `${fatGrams}g`;
  document.getElementById('res-water').textContent = `${waterTarget.toLocaleString()} ml/day`;

  const goalSub = document.getElementById('res-goal-sub');
  if (goalSub) {
    if (goal === 'deficit') goalSub.textContent = 'Sustainable Fat Loss (-15%)';
    else if (goal === 'surplus') goalSub.textContent = 'Lean Muscle Gain (+10%)';
    else goalSub.textContent = 'Maintain Current Weight';
  }

  const resultsPanel = document.getElementById('calc-results');
  if (resultsPanel) resultsPanel.style.display = 'block';

  // Attach button action
  const applyBtn = document.getElementById('apply-calc-to-dash-btn');
  if (applyBtn) {
    applyBtn.onclick = function() {
      state.user.calorieTarget = targetCalories;
      state.user.waterGoal = waterTarget;
      setData('user', state.user);
      renderDashboard();
      showToast(`Saved ${targetCalories} kcal & ${waterTarget}ml to your dashboard targets!`, 'success');
    };
  }

  showToast('Metabolic needs computed!', 'info');
}

function renderFoodSubstitutions(searchQuery = '') {
  const tbody = document.getElementById('subs-table-body');
  if (!tbody) return;

  let list = [...SEED_SUBSTITUTIONS];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(s => s.original.toLowerCase().includes(q) || s.swap.toLowerCase().includes(q) || s.benefit.toLowerCase().includes(q));
  }

  tbody.innerHTML = '';
  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.original}</strong></td>
      <td><span class="gradient-text font-medium">${s.swap}</span></td>
      <td class="text-xs text-muted">${s.benefit}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================================================
// 13. WELLNESS JOURNAL & SLEEP/MOOD LOGGING
// ============================================================================

let currentSelectedMood = 'peaceful';

function initJournal() {
  const dateInput = document.getElementById('checkin-date');
  if (dateInput) dateInput.value = TODAY_STR;

  // Mood selector buttons
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSelectedMood = btn.getAttribute('data-mood');
    });
  });

  // Energy slider display update
  const slider = document.getElementById('energy-slider');
  const disp = document.getElementById('energy-val-display');
  if (slider && disp) {
    slider.addEventListener('input', (e) => {
      disp.textContent = `${e.target.value} / 10`;
    });
  }

  renderJournalEntries();
}

function saveDailyCheckIn(e) {
  if (e) e.preventDefault();

  const dateVal = document.getElementById('checkin-date').value || TODAY_STR;
  const energyVal = parseInt(document.getElementById('energy-slider').value, 10) || 8;
  const sleepHours = parseFloat(document.getElementById('sleep-hours').value) || 7.5;
  const sleepQuality = document.getElementById('sleep-quality').value;
  const notes = document.getElementById('journal-notes').value.trim();

  if (!state.dailyLogs[dateVal]) {
    state.dailyLogs[dateVal] = { water: 0, completedHabits: [], activeMinutes: 0, caloriesBurned: 0 };
  }

  state.dailyLogs[dateVal].journal = {
    mood: currentSelectedMood,
    energy: energyVal,
    sleepHours: sleepHours,
    sleepQuality: sleepQuality,
    notes: notes,
    savedAt: new Date().toISOString()
  };

  setData('daily_logs', state.dailyLogs);
  renderJournalEntries();
  showToast('Daily wellness check-in recorded! 🌿', 'success');
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries-container');
  const emptyState = document.getElementById('journal-empty-state');
  if (!container) return;

  const entries = [];
  Object.keys(state.dailyLogs).forEach(dateStr => {
    const entry = state.dailyLogs[dateStr]?.journal;
    if (entry) {
      entries.push({ date: dateStr, ...entry });
    }
  });

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (entries.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.innerHTML = '';

  entries.forEach(e => {
    const item = document.createElement('div');
    item.className = 'journal-entry-item';
    item.innerHTML = `
      <div class="journal-item-header">
        <span class="journal-date-badge">📅 ${e.date}</span>
        <button class="btn-remove-meal" onclick="deleteJournalEntry('${e.date}')" title="Delete entry">&times;</button>
      </div>
      <div class="journal-meta-row">
        <span>Mood: <strong>${e.mood.toUpperCase()}</strong></span>
        <span>⚡ Energy: <strong>${e.energy}/10</strong></span>
        <span>🌙 Sleep: <strong>${e.sleepHours} hrs</strong></span>
      </div>
      ${e.notes ? `<div class="journal-note-text">"${e.notes}"</div>` : ''}
    `;
    container.appendChild(item);
  });
}

function deleteJournalEntry(dateStr) {
  if (state.dailyLogs[dateStr]) {
    state.dailyLogs[dateStr].journal = null;
    setData('daily_logs', state.dailyLogs);
    renderJournalEntries();
    showToast('Entry removed.', 'info');
  }
}

// ============================================================================
// 14. BLOG & EDUCATIONAL ARTICLES MODULE
// ============================================================================

let currentBlogFilter = 'all';

function renderArticles() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const bookmarkCount = document.getElementById('blog-bookmarks-count');
  if (bookmarkCount) bookmarkCount.textContent = state.bookmarkedArticles.length;

  let list = [...SEED_ARTICLES];
  if (currentBlogFilter === 'bookmarks') {
    list = list.filter(a => state.bookmarkedArticles.includes(a.id));
  } else if (currentBlogFilter !== 'all') {
    list = list.filter(a => a.category.toLowerCase() === currentBlogFilter.toLowerCase());
  }

  grid.innerHTML = '';
  list.forEach(art => {
    const isBookmarked = state.bookmarkedArticles.includes(art.id);
    const card = document.createElement('article');
    card.className = 'blog-card glass-card';
    card.innerHTML = `
      <div class="blog-img-wrap">
        <img src="${art.image}" alt="${art.title}" class="blog-img" loading="lazy">
        <span class="blog-category-tag">${art.category}</span>
      </div>
      <div class="blog-body">
        <div class="blog-meta-row">
          <span>⏱️ ${art.readTime}</span>
          <span>📅 ${art.date}</span>
        </div>
        <h3 class="blog-title">${art.title}</h3>
        <p class="blog-excerpt">${art.excerpt}</p>
        <div class="blog-footer">
          <button class="btn btn-sm btn-primary" onclick="openArticleModal('${art.id}')">Read Full Article</button>
          <button class="btn btn-icon-round" onclick="toggleBookmarkArticle('${art.id}')" title="Bookmark article">
            ${isBookmarked ? '🔖' : '📑'}
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function toggleBookmarkArticle(id) {
  const idx = state.bookmarkedArticles.indexOf(id);
  if (idx > -1) {
    state.bookmarkedArticles.splice(idx, 1);
    showToast('Removed from saved articles.');
  } else {
    state.bookmarkedArticles.push(id);
    showToast('Article bookmarked! 🔖', 'success');
  }
  setData('bookmarked_articles', state.bookmarkedArticles);
  renderArticles();
}

function openArticleModal(articleId) {
  const art = SEED_ARTICLES.find(a => a.id === articleId);
  if (!art) return;

  const container = document.getElementById('article-modal-content');
  if (!container) return;

  container.innerHTML = `
    <div class="blog-img-wrap mb-3" style="height: 260px; border-radius: var(--radius-sm);">
      <img src="${art.image}" alt="${art.title}" class="blog-img">
    </div>
    <span class="card-badge nutrition-badge mb-2">${art.category.toUpperCase()}</span>
    <h2>${art.title}</h2>
    <div class="blog-meta-row mt-2 mb-3">
      <span>✍️ ${art.author}</span>
      <span>⏱️ ${art.readTime} • ${art.date}</span>
    </div>
    <div class="article-body-content text-secondary" style="line-height: 1.7;">
      ${art.content}
    </div>
    
    <div class="tip-badge mt-4">
      <strong>Key Takeaways:</strong>
      <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
        ${(art.keyTakeaways || []).map(k => `<li>${k}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-actions mt-4">
      <button class="btn btn-primary" onclick="closeModal('article-modal')">Done Reading</button>
    </div>
  `;

  openModal('article-modal');
}

// ============================================================================
// 15. CUSTOM USER CONTENT CREATION (Custom Recipes, Workouts, Habits)
// ============================================================================

function handleCustomRecipeSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('cr-title').value.trim();
  const category = document.getElementById('cr-category').value;
  const prepTime = parseInt(document.getElementById('cr-time').value, 10) || 15;
  const servings = parseInt(document.getElementById('cr-servings').value, 10) || 2;
  const calories = parseInt(document.getElementById('cr-calories').value, 10) || 350;
  const protein = parseInt(document.getElementById('cr-protein').value, 10) || 0;
  const carbs = parseInt(document.getElementById('cr-carbs').value, 10) || 0;
  const fat = parseInt(document.getElementById('cr-fat').value, 10) || 0;
  const dietaryRaw = document.getElementById('cr-dietary').value.trim();
  const ingRaw = document.getElementById('cr-ingredients').value.trim();
  const instRaw = document.getElementById('cr-instructions').value.trim();

  const ingredients = ingRaw.split('\n').filter(l => l.trim()).map(line => {
    return { name: line.trim(), amount: 1, unit: '' };
  });

  const instructions = instRaw.split('\n').filter(l => l.trim());
  const dietaryTags = dietaryRaw ? dietaryRaw.split(',').map(t => t.trim()) : ['Custom'];

  const newRecipe = {
    id: 'user_rec_' + Date.now(),
    title,
    category,
    prepTime,
    servings,
    calories,
    protein,
    carbs,
    fat,
    dietaryTags,
    ingredients,
    instructions,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700',
    description: 'Custom recipe created by you.'
  };

  state.recipes.unshift(newRecipe);
  setData('recipes', state.recipes);

  document.getElementById('custom-recipe-form').reset();
  closeModal('custom-recipe-modal');
  renderRecipes();
  checkBadges();
  showToast(`Created custom recipe "${title}"! 🥗`, 'success');
}

function handleCustomWorkoutSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('cw-title').value.trim();
  const category = document.getElementById('cw-category').value;
  const difficulty = document.getElementById('cw-difficulty').value;
  const durationMinutes = parseInt(document.getElementById('cw-duration').value, 10) || 20;
  const caloriesBurned = parseInt(document.getElementById('cw-calories').value, 10) || 150;
  const equipment = document.getElementById('cw-equipment').value.trim() || 'Bodyweight';
  const exercisesRaw = document.getElementById('cw-exercises').value.trim();
  const notes = document.getElementById('cw-notes').value.trim();

  const exercises = exercisesRaw.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split('|').map(p => p.trim());
    return {
      name: parts[0] || 'Exercise',
      durationSec: 45,
      restSec: 15
    };
  });

  const newWorkout = {
    id: 'user_wo_' + Date.now(),
    title,
    category,
    difficulty,
    durationMinutes,
    caloriesBurned,
    equipment,
    exercises,
    instructions: notes || 'Perform with control and steady pacing.',
    safetyTips: 'Maintain neutral spine.'
  };

  state.workouts.unshift(newWorkout);
  setData('workouts', state.workouts);

  document.getElementById('custom-workout-form').reset();
  closeModal('custom-workout-modal');
  renderWorkouts();
  showToast(`Created routine "${title}"! 🏋️`, 'success');
}

function handleCustomHabitSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('habit-name-input').value.trim();
  const icon = document.getElementById('habit-icon-input').value.trim() || '🌟';

  if (!name) return;

  const newHabit = {
    id: 'hab_' + Date.now(),
    name,
    icon,
    category: 'custom'
  };

  state.habitsList.push(newHabit);
  setData('custom_habits', state.habitsList);

  document.getElementById('custom-habit-form').reset();
  closeModal('custom-habit-modal');
  renderHabitsTracker();
  showToast(`Added habit: ${name}!`, 'success');
}

// ============================================================================
// 17. INBUILT NUTRIFIT GUIDE AGENT (Rule-Based Offline Wellness Companion)
// ============================================================================

const DEFAULT_GUIDE_WELCOME = {
  id: 'msg_welcome',
  sender: 'guide',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  text: `Hello! I am your **NutriFit Guide**, crafted by Hazr Studios. How can I help you today?

I can recommend whole-food recipes, suggest targeted workouts, check your hydration, assist with your meal planning, or guide you around the platform! Tap a quick prompt below or type any question.`,
  actions: [
    { label: '🥗 Suggest a Healthy Meal', action: 'suggest_meal' },
    { label: '🏋️ Find a Workout', action: 'workouts' },
    { label: '💧 How do I log water?', action: 'water_help' },
    { label: '🧮 Compute Calories & Macros', action: 'calc' }
  ]
};

function initNutriFitGuide() {
  const floatingBtn = document.getElementById('guide-floating-btn');
  const headerBtn = document.getElementById('guide-header-btn');
  const closeBtn = document.getElementById('close-guide-chat-btn');
  const clearBtn = document.getElementById('clear-guide-chat-btn');
  const chatForm = document.getElementById('guide-chat-form');
  const chatInput = document.getElementById('guide-chat-input');
  const quickPills = document.querySelectorAll('.quick-prompt-pill');

  if (floatingBtn) floatingBtn.addEventListener('click', toggleGuideChat);
  if (headerBtn) headerBtn.addEventListener('click', openGuideChat);
  if (closeBtn) closeBtn.addEventListener('click', closeGuideChat);
  if (clearBtn) clearBtn.addEventListener('click', clearGuideChat);

  if (quickPills) {
    quickPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const promptText = pill.getAttribute('data-prompt');
        if (promptText) {
          sendGuideUserMessage(promptText);
        }
      });
    });
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      chatInput.value = '';
      sendGuideUserMessage(val);
    });
  }

  // Ensure default message exists if history is empty
  if (!state.guideHistory || state.guideHistory.length === 0) {
    state.guideHistory = [DEFAULT_GUIDE_WELCOME];
    setData('guide_history', state.guideHistory);
  }

  renderGuideMessages();
}

function openGuideChat() {
  const widget = document.getElementById('guide-chat-widget');
  if (widget) {
    widget.style.display = 'flex';
    widget.setAttribute('aria-hidden', 'false');
    renderGuideMessages();
    const input = document.getElementById('guide-chat-input');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function closeGuideChat() {
  const widget = document.getElementById('guide-chat-widget');
  if (widget) {
    widget.style.display = 'none';
    widget.setAttribute('aria-hidden', 'true');
  }
}

function toggleGuideChat() {
  const widget = document.getElementById('guide-chat-widget');
  if (widget) {
    if (widget.style.display === 'none' || !widget.style.display) {
      openGuideChat();
    } else {
      closeGuideChat();
    }
  }
}

function clearGuideChat() {
  if (confirm('Clear NutriFit Guide conversation history?')) {
    state.guideHistory = [DEFAULT_GUIDE_WELCOME];
    setData('guide_history', state.guideHistory);
    renderGuideMessages();
    showToast('Guide conversation cleared.', 'info');
  }
}

function sendGuideUserMessage(text) {
  openGuideChat();

  const userMsg = {
    id: 'msg_user_' + Date.now(),
    sender: 'user',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: text
  };

  state.guideHistory.push(userMsg);
  setData('guide_history', state.guideHistory);
  renderGuideMessages();

  // Show typing indicator
  const typingEl = document.getElementById('guide-typing-indicator');
  if (typingEl) typingEl.style.display = 'flex';
  scrollToGuideBottom();

  // Rule-based response engine with realistic brief delay
  setTimeout(() => {
    if (typingEl) typingEl.style.display = 'none';
    const responseObj = processGuideQuery(text);

    state.guideHistory.push(responseObj);
    setData('guide_history', state.guideHistory);
    renderGuideMessages();
    playAudioChime('beep');
  }, 400);
}

/**
 * Hardcoded, rule-based NLP intent matcher in pure vanilla JavaScript
 */
function processGuideQuery(query) {
  const q = query.toLowerCase().trim();
  const userName = state.user.name || 'Friend';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. GREETINGS & IDENTITY
  if (matchesAny(q, ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening', 'who are you', 'what are you', 'how do you work', 'help'])) {
    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `Hello ${userName}! I am your **NutriFit Guide**, engineered by **Hazr Studios**.

I run 100% locally on your device without AI APIs, external servers, or data collection. I can suggest recipes matching your dietary goals, find workouts, check your hydration, or help you plan your week!`,
      actions: [
        { label: '🥗 Suggest a Meal', action: 'suggest_meal' },
        { label: '🏋️ Start a Workout', action: 'workouts' },
        { label: '🧮 Calculate BMR & Macros', action: 'calc' }
      ]
    };
  }

  // 2. RECIPES, MEALS & NUTRITION
  if (matchesAny(q, ['recipe', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'eat', 'hungry', 'cook', 'salmon', 'chicken', 'tofu', 'salad', 'oats', 'smoothie', 'vegetarian', 'vegan', 'protein'])) {
    let rec = null;
    const userDiet = (state.user.dietary || 'none').toLowerCase();

    if (q.includes('breakfast')) {
      rec = state.recipes.find(r => r.category === 'breakfast') || state.recipes[0];
    } else if (q.includes('snack')) {
      rec = state.recipes.find(r => r.category === 'snack') || state.recipes[6];
    } else if (q.includes('vegan') || userDiet === 'vegan') {
      rec = state.recipes.find(r => r.dietaryTags.includes('Vegan')) || state.recipes[5];
    } else if (q.includes('protein') || userDiet === 'high-protein') {
      rec = state.recipes.find(r => r.dietaryTags.includes('High-Protein')) || state.recipes[2];
    } else {
      rec = state.recipes[Math.floor(Math.random() * state.recipes.length)];
    }

    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `Based on your wellness focus, I recommend the **${rec.title}**!

• **Category:** ${rec.category.toUpperCase()} (${rec.prepTime} mins)
• **Energy:** ${rec.calories} kcal | ${rec.protein || 0}g Protein | ${rec.carbs || 0}g Carbs
• **Summary:** ${rec.description || ''}`,
      actions: [
        { label: `View ${rec.title}`, action: 'recipe_modal', recipeId: rec.id },
        { label: '🎲 Surprise Me', action: 'random_recipe' },
        { label: 'Explore All Recipes', action: 'recipes' }
      ]
    };
  }

  // 3. WORKOUTS, TRAINING & EXERCISE
  if (matchesAny(q, ['workout', 'exercise', 'training', 'sweat', 'cardio', 'hiit', 'strength', 'stretch', 'mobility', 'home workout', 'beginner workout', 'timer', 'burn', 'active'])) {
    let wo = null;
    if (q.includes('stretch') || q.includes('mobility')) {
      wo = state.workouts.find(w => w.category === 'mobility') || state.workouts[3];
    } else if (q.includes('hiit') || q.includes('cardio')) {
      wo = state.workouts.find(w => w.category === 'hiit') || state.workouts[0];
    } else {
      wo = state.workouts.find(w => w.difficulty === 'beginner') || state.workouts[1];
    }

    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `Ready to move, ${userName}? I suggest the **${wo.title}**!

• **Duration:** ${wo.durationMinutes} minutes (~${wo.caloriesBurned} kcal)
• **Level:** ${wo.difficulty.toUpperCase()} | Equipment: ${wo.equipment || 'None'}
• **Focus:** ${wo.focus || 'Functional fitness'}`,
      actions: [
        { label: `Start Timer (${wo.durationMinutes}m) ⏱️`, action: 'workout_timer', workoutId: wo.id },
        { label: 'View Routine Details', action: 'workout_modal', workoutId: wo.id },
        { label: 'All Routines', action: 'workouts' }
      ]
    };
  }

  // 4. HYDRATION / WATER TRACKING
  if (matchesAny(q, ['water', 'hydrate', 'hydration', 'drink', 'thirsty', 'fluid', 'glasses', 'bottle'])) {
    const today = state.dailyLogs[TODAY_STR] || { water: 0 };
    const goal = state.user.waterGoal || 2500;
    const logged = today.water || 0;
    const pct = Math.min(100, Math.round((logged / goal) * 100));
    const remaining = Math.max(0, goal - logged);

    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `💧 **Daily Hydration Status:**

You have logged **${logged.toLocaleString()} ml** today out of your **${goal.toLocaleString()} ml** goal (${pct}%).
${remaining === 0 ? '🎉 Amazing job! You have hit your daily hydration target!' : `You need approximately **${remaining.toLocaleString()} ml** more to reach your goal.`}

Consistent water intake supports joint lubrication, energy, and nutrient absorption.`,
      actions: [
        { label: '+250ml Water 💧', action: 'log_water_250' },
        { label: '+500ml Water 💧', action: 'log_water_500' },
        { label: 'Go to Water Tracker', action: 'dashboard' }
      ]
    };
  }

  // 5. MEAL PLANNING & GROCERY LIST
  if (matchesAny(q, ['plan', 'planner', 'meal plan', 'meal prep', 'week', 'schedule', 'grocery', 'shopping', 'shopping list', 'duplicate', 'ingredients'])) {
    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `📋 **NutriFit Meal Planner & Shopping Guide:**

1. Navigate to the **Meal Planner** section.
2. Select your day (Mon–Sun) and assign meals to Breakfast, Lunch, Dinner, or Snacks.
3. Use the **Copy Day** tool to duplicate meal plans across the week.
4. Tap **Generate Shopping List** to aggregate all required ingredients into organized categories (Produce, Dairy, Pantry, etc.) with check-off support!`,
      actions: [
        { label: 'Open Meal Planner', action: 'planner' },
        { label: 'Generate Shopping List 🛒', action: 'gen_shopping' }
      ]
    };
  }

  // 6. HABITS & STREAKS
  if (matchesAny(q, ['habit', 'habits', 'streak', 'routine', 'ritual', 'daily', 'consistency'])) {
    const today = state.dailyLogs[TODAY_STR] || { completedHabits: [] };
    const completedCount = (today.completedHabits || []).length;
    const totalCount = state.habitsList.length;
    const streak = calculateWellnessStreak();

    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `✨ **Daily Habits & Streak Report:**

• **Today's Habits Completed:** ${completedCount} of ${totalCount}
• **Current Wellness Streak:** 🔥 ${streak} consecutive days!

Habit stacking and small daily rituals compound over time to create lifelong vitality.`,
      actions: [
        { label: 'Check Today\'s Habits', action: 'dashboard' },
        { label: '+ Add Custom Habit', action: 'custom_habit' }
      ]
    };
  }

  // 7. CALORIES, MACROS & BMR/TDEE CALCULATOR
  if (matchesAny(q, ['calorie', 'calories', 'macro', 'macros', 'bmr', 'tdee', 'calculate', 'calculator', 'protein goal', 'metabolism', 'deficit', 'surplus'])) {
    const targetCals = state.user.calorieTarget || 2000;
    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `🧮 **Metabolic Blueprint Guidance:**

Your current daily intake target is **${targetCals.toLocaleString()} kcal**.

NutriFit uses the clinically validated **Mifflin-St Jeor formula** to estimate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). You can compute customized macros for fat loss, maintenance, or muscle gain in the Calculator section.`,
      actions: [
        { label: 'Open BMR & Macro Calculator 🧮', action: 'calc' },
        { label: 'View Target Meters', action: 'dashboard' }
      ]
    };
  }

  // 8. STORAGE, PRIVACY & BACKUPS
  if (matchesAny(q, ['storage', 'backup', 'export', 'import', 'privacy', 'localstorage', 'reset', 'clear', 'json', 'data', 'cloud'])) {
    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `🔒 **Privacy & Local Storage Pledge:**

NutriFit operates **100% on your device**. All recipes, custom routines, water records, and journal entries are kept inside your browser's private \`localStorage\`.

• No remote database or cloud tracking.
• You can export your data snapshot as a \`.json\` file anytime or import it on another computer!`,
      actions: [
        { label: 'Export Backup JSON ⬇️', action: 'export_data' },
        { label: 'Open Preferences & Backup', action: 'settings' }
      ]
    };
  }

  // 9. ABOUT HAZR STUDIOS & PHILOSOPHY
  if (matchesAny(q, ['about', 'hazr', 'hazr studios', 'who made this', 'creator', 'philosophy', 'mission'])) {
    return {
      id: 'msg_bot_' + Date.now(),
      sender: 'guide',
      timestamp: timeNow,
      text: `🌿 **About NutriFit by Hazr Studios:**

NutriFit is a modern wellness platform crafted by **Hazr Studios**.
Our philosophy: **"Eat Better. Move Better. Live Better."**

We believe that sustainable nutrition, enjoyable daily movement, and privacy-respecting technology should be accessible to everyone without paywalls or invasive tracking.`,
      actions: [
        { label: 'Read Our Story', action: 'about' },
        { label: 'Contact Hazr Studios', action: 'contact' }
      ]
    };
  }

  // 10. HELPFUL FALLBACK
  return {
    id: 'msg_bot_' + Date.now(),
    sender: 'guide',
    timestamp: timeNow,
    text: `I'm a built-in, rule-based wellness guide by Hazr Studios. I didn't quite catch that, but I can help you with:

• 🥗 Finding a delicious high-protein, vegan, or quick recipe
• 🏋️ Starting a guided bodyweight or strength workout
• 💧 Checking your daily water intake
• 📋 Planning your meals and generating a grocery list
• 🧮 Calculating your BMR & daily calorie goals

What would you like to explore?`,
    actions: [
      { label: '🥗 Suggest a Meal', action: 'suggest_meal' },
      { label: '🏋️ Start a Workout', action: 'workouts' },
      { label: '💧 Water Status', action: 'water_help' },
      { label: '🧮 BMR Calculator', action: 'calc' }
    ]
  };
}

function matchesAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}

function renderGuideMessages() {
  const container = document.getElementById('guide-messages-list');
  if (!container) return;

  const history = state.guideHistory || [DEFAULT_GUIDE_WELCOME];
  container.innerHTML = '';

  history.forEach(msg => {
    const el = document.createElement('div');
    el.className = `guide-msg ${msg.sender}`;
    
    // Format simple markdown bold and lists
    let formattedText = msg.text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n•/g, '<br>•');

    let actionsHtml = '';
    if (msg.actions && msg.actions.length > 0) {
      actionsHtml = `
        <div class="guide-actions-wrap">
          ${msg.actions.map(a => `
            <button class="guide-action-btn" onclick="executeGuideAction('${a.action}', '${a.recipeId || ''}', '${a.workoutId || ''}', '${a.prompt || ''}')">
              ${a.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="guide-msg-bubble">
        <div>${formattedText}</div>
        ${actionsHtml}
      </div>
      <span class="guide-msg-time">${msg.timestamp}</span>
    `;

    container.appendChild(el);
  });

  scrollToGuideBottom();
}

function scrollToGuideBottom() {
  const container = document.getElementById('guide-messages-list');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function executeGuideAction(action, recipeId, workoutId, promptText) {
  if (promptText) {
    sendGuideUserMessage(promptText);
    return;
  }

  if (action === 'recipe_modal' && recipeId) {
    openRecipeDetailModal(recipeId);
  } else if (action === 'workout_timer' && workoutId) {
    startWorkoutSession(workoutId);
  } else if (action === 'workout_modal' && workoutId) {
    openWorkoutDetailsModal(workoutId);
  } else if (action === 'random_recipe') {
    openRandomRecipeModal();
  } else if (action === 'suggest_meal') {
    sendGuideUserMessage('Suggest a healthy meal');
  } else if (action === 'water_help') {
    sendGuideUserMessage('How do I log water?');
  } else if (action === 'recipes') {
    navigateToSection('#recipes');
  } else if (action === 'workouts') {
    navigateToSection('#workouts');
  } else if (action === 'planner') {
    navigateToSection('#planner');
  } else if (action === 'calc') {
    navigateToSection('#nutrition');
  } else if (action === 'dashboard') {
    navigateToSection('#dashboard');
  } else if (action === 'about') {
    navigateToSection('#about');
  } else if (action === 'contact') {
    navigateToSection('#contact');
  } else if (action === 'log_water_250') {
    quickLogWater(250);
  } else if (action === 'log_water_500') {
    quickLogWater(500);
  } else if (action === 'gen_shopping') {
    generateShoppingListFromPlan();
  } else if (action === 'export_data') {
    exportUserData();
  } else if (action === 'settings') {
    openModal('settings-modal');
  } else if (action === 'custom_habit') {
    openModal('custom-habit-modal');
  }
}

function navigateToSection(hashId) {
  const el = document.querySelector(hashId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === hashId);
    });
  }
}

// ============================================================================
// 18. DOM INITIALIZATION & EVENT DISPATCHERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkOnboarding();
  initNutriFitGuide();

  // Navigation Links & Smooth Scrolling
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        navigateToSection(targetId);
        document.getElementById('mobile-nav-drawer').classList.remove('open');
      }
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // Theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Settings & Preferences Modal
  const settingsBtn = document.getElementById('settings-btn');
  const mobileSettingsBtn = document.getElementById('mobile-settings-btn');
  const footerPrefLink = document.getElementById('footer-preferences-link');

  const openSettingsHandler = () => {
    document.getElementById('set-name').value = state.user.name || '';
    document.getElementById('set-water-goal').value = state.user.waterGoal || 2500;
    document.getElementById('set-calorie-target').value = state.user.calorieTarget || 2000;
    document.getElementById('set-dietary-pref').value = state.user.dietary || 'none';
    document.getElementById('set-allergies').value = state.user.allergies || '';
    document.getElementById('set-theme').value = state.theme || 'light';
    openModal('settings-modal');
  };

  if (settingsBtn) settingsBtn.addEventListener('click', openSettingsHandler);
  if (mobileSettingsBtn) mobileSettingsBtn.addEventListener('click', openSettingsHandler);
  if (footerPrefLink) footerPrefLink.addEventListener('click', openSettingsHandler);

  // Settings Tabs Switcher
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-stab');
      const pane = document.getElementById(`settings-${tabId}-tab`);
      if (pane) pane.classList.add('active');
    });
  });

  // Settings Profile Form Submit
  const profileForm = document.getElementById('settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.user.name = document.getElementById('set-name').value.trim() || 'Wellness Explorer';
      state.user.waterGoal = parseInt(document.getElementById('set-water-goal').value, 10) || 2500;
      state.user.calorieTarget = parseInt(document.getElementById('set-calorie-target').value, 10) || 2000;
      state.user.dietary = document.getElementById('set-dietary-pref').value;
      state.user.allergies = document.getElementById('set-allergies').value.trim();

      const chosenTheme = document.getElementById('set-theme').value;
      state.theme = chosenTheme;
      setData('theme', chosenTheme);
      initTheme();

      setData('user', state.user);
      closeModal('settings-modal');
      renderDashboard();
      renderRecipes();
      showToast('Preferences updated successfully!', 'success');
    });
  }

  // Backup Export & Import buttons
  const exportBtn = document.getElementById('export-json-btn');
  const footerExport = document.getElementById('footer-export-link');
  if (exportBtn) exportBtn.addEventListener('click', exportUserData);
  if (footerExport) footerExport.addEventListener('click', exportUserData);

  const importInput = document.getElementById('import-json-file');
  const footerImport = document.getElementById('footer-import-link');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importUserData(e.target.files[0]);
      }
    });
  }
  if (footerImport) {
    footerImport.addEventListener('click', () => {
      if (importInput) importInput.click();
    });
  }

  // Danger Zone: Reset All Data
  const resetBtn = document.getElementById('reset-all-data-btn');
  const footerReset = document.getElementById('footer-reset-link');
  const triggerResetConfirm = () => {
    document.getElementById('confirm-modal-title').textContent = 'Reset All NutriFit Data?';
    document.getElementById('confirm-modal-message').textContent = 'This will delete all custom recipes, workout logs, habits, meal plans, and water history, restoring factory defaults. This action cannot be undone.';
    
    const confirmActionBtn = document.getElementById('confirm-action-btn');
    confirmActionBtn.onclick = () => {
      clearNutriFitData();
      closeModal('confirm-modal');
      showToast('All local data cleared. Reloading...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    };
    openModal('confirm-modal');
  };

  if (resetBtn) resetBtn.addEventListener('click', triggerResetConfirm);
  if (footerReset) footerReset.addEventListener('click', triggerResetConfirm);

  const cancelConfirm = document.getElementById('confirm-cancel-btn');
  if (cancelConfirm) cancelConfirm.addEventListener('click', () => closeModal('confirm-modal'));

  // Recipe Category Filter Handlers
  document.querySelectorAll('#recipe-filter-pills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#recipe-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentRecipeFilter = pill.getAttribute('data-filter');
      renderRecipes();
    });
  });

  // Secondary Time Filters
  document.querySelectorAll('#recipe-time-filters .filter-mini-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#recipe-time-filters .filter-mini-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentRecipeTime = pill.getAttribute('data-time');
      renderRecipes();
    });
  });

  // Secondary Difficulty Filters
  document.querySelectorAll('#recipe-diff-filters .filter-mini-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#recipe-diff-filters .filter-mini-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentRecipeDiff = pill.getAttribute('data-rdiff');
      renderRecipes();
    });
  });

  const clearRecentRecipesBtn = document.getElementById('clear-recent-recipes-btn');
  if (clearRecentRecipesBtn) clearRecentRecipesBtn.addEventListener('click', clearRecentlyViewedRecipes);

  const recipeSearchInput = document.getElementById('recipe-search-input');
  const clearRecipeSearchBtn = document.getElementById('clear-recipe-search');
  if (recipeSearchInput) {
    recipeSearchInput.addEventListener('input', (e) => {
      currentRecipeSearch = e.target.value;
      if (clearRecipeSearchBtn) {
        clearRecipeSearchBtn.style.display = currentRecipeSearch ? 'block' : 'none';
      }
      renderRecipes();
    });
  }
  if (clearRecipeSearchBtn) {
    clearRecipeSearchBtn.addEventListener('click', () => {
      if (recipeSearchInput) recipeSearchInput.value = '';
      currentRecipeSearch = '';
      clearRecipeSearchBtn.style.display = 'none';
      renderRecipes();
    });
  }

  const recipeSortSelect = document.getElementById('recipe-sort-select');
  if (recipeSortSelect) {
    recipeSortSelect.addEventListener('change', renderRecipes);
  }

  const randomRecipeBtn = document.getElementById('random-recipe-btn');
  if (randomRecipeBtn) randomRecipeBtn.addEventListener('click', openRandomRecipeModal);

  // Fridge Drawer
  const fridgeBtn = document.getElementById('fridge-search-btn');
  const fridgeDrawer = document.getElementById('fridge-drawer');
  const closeFridgeDrawer = document.getElementById('close-fridge-drawer');
  const clearFridgeTags = document.getElementById('clear-fridge-tags');

  if (fridgeBtn && fridgeDrawer) {
    fridgeBtn.addEventListener('click', () => {
      fridgeDrawer.style.display = fridgeDrawer.style.display === 'none' ? 'block' : 'none';
    });
  }
  if (closeFridgeDrawer && fridgeDrawer) {
    closeFridgeDrawer.addEventListener('click', () => {
      fridgeDrawer.style.display = 'none';
    });
  }
  if (clearFridgeTags) {
    clearFridgeTags.addEventListener('click', () => {
      currentFridgeIngredients = [];
      document.querySelectorAll('.fridge-tag').forEach(t => t.classList.remove('selected'));
      const statusEl = document.getElementById('fridge-match-status');
      if (statusEl) statusEl.textContent = '0 ingredients selected';
      renderRecipes();
    });
  }

  initFridgeMatcher();

  // Custom Recipe Modal Triggers
  const createRecipeBtn = document.getElementById('create-recipe-btn');
  if (createRecipeBtn) {
    createRecipeBtn.addEventListener('click', () => openModal('custom-recipe-modal'));
  }
  const customRecipeClose = document.getElementById('custom-recipe-close');
  const cancelCustomRecipe = document.getElementById('cancel-custom-recipe-btn');
  if (customRecipeClose) customRecipeClose.addEventListener('click', () => closeModal('custom-recipe-modal'));
  if (cancelCustomRecipe) cancelCustomRecipe.addEventListener('click', () => closeModal('custom-recipe-modal'));

  const customRecipeForm = document.getElementById('custom-recipe-form');
  if (customRecipeForm) customRecipeForm.addEventListener('submit', handleCustomRecipeSubmit);

  const recipeModalClose = document.getElementById('recipe-modal-close');
  if (recipeModalClose) recipeModalClose.addEventListener('click', () => closeModal('recipe-modal'));

  // Workout Library Controls
  document.querySelectorAll('#workout-category-pills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#workout-category-pills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentWorkoutFilter = pill.getAttribute('data-wfilter');
      renderWorkouts();
    });
  });

  const workoutDiffSelect = document.getElementById('workout-diff-select');
  if (workoutDiffSelect) {
    workoutDiffSelect.addEventListener('change', (e) => {
      currentWorkoutDiff = e.target.value;
      renderWorkouts();
    });
  }

  const workoutSearchInput = document.getElementById('workout-search-input');
  if (workoutSearchInput) {
    workoutSearchInput.addEventListener('input', (e) => {
      currentWorkoutSearch = e.target.value;
      renderWorkouts();
    });
  }

  const createWorkoutBtn = document.getElementById('create-workout-btn');
  if (createWorkoutBtn) {
    createWorkoutBtn.addEventListener('click', () => openModal('custom-workout-modal'));
  }

  const customWorkoutClose = document.getElementById('custom-workout-close');
  const cancelCustomWorkout = document.getElementById('cancel-custom-workout-btn');
  if (customWorkoutClose) customWorkoutClose.addEventListener('click', () => closeModal('custom-workout-modal'));
  if (cancelCustomWorkout) cancelCustomWorkout.addEventListener('click', () => closeModal('custom-workout-modal'));

  const customWorkoutForm = document.getElementById('custom-workout-form');
  if (customWorkoutForm) customWorkoutForm.addEventListener('submit', handleCustomWorkoutSubmit);

  const workoutModalClose = document.getElementById('workout-modal-close');
  if (workoutModalClose) workoutModalClose.addEventListener('click', () => {
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    closeModal('workout-modal');
  });

  const viewHistoryBtn = document.getElementById('view-workout-history-btn');
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      renderWorkoutHistory();
      openModal('workout-history-modal');
    });
  }

  const historyClose = document.getElementById('workout-history-close');
  const closeHistoryBtn = document.getElementById('close-history-modal-btn');
  if (historyClose) historyClose.addEventListener('click', () => closeModal('workout-history-modal'));
  if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', () => closeModal('workout-history-modal'));

  const clearHistoryBtn = document.getElementById('clear-workout-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      state.workoutHistory = [];
      setData('workout_history', state.workoutHistory);
      renderWorkoutHistory();
      renderWorkouts();
      showToast('Workout history cleared.', 'info');
    });
  }

  // Activity Log Modal Handlers
  const dashLogActivityBtn = document.getElementById('dash-log-activity-btn');
  if (dashLogActivityBtn) {
    dashLogActivityBtn.addEventListener('click', () => openModal('activity-log-modal'));
  }
  const activityModalClose = document.getElementById('activity-modal-close');
  const cancelActivityBtn = document.getElementById('cancel-activity-btn');
  if (activityModalClose) activityModalClose.addEventListener('click', () => closeModal('activity-log-modal'));
  if (cancelActivityBtn) cancelActivityBtn.addEventListener('click', () => closeModal('activity-log-modal'));

  const activityLogForm = document.getElementById('activity-log-form');
  if (activityLogForm) {
    activityLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('act-type').value;
      const duration = parseInt(document.getElementById('act-duration').value, 10) || 30;
      const calories = parseInt(document.getElementById('act-calories').value, 10) || 160;
      const steps = parseInt(document.getElementById('act-steps').value, 10) || 0;
      const notes = document.getElementById('act-notes').value.trim();

      const today = state.dailyLogs[TODAY_STR];
      today.activeMinutes = (today.activeMinutes || 0) + duration;
      today.caloriesBurned = (today.caloriesBurned || 0) + calories;
      setData('daily_logs', state.dailyLogs);

      const record = {
        id: 'act_' + Date.now(),
        title: `${type}${notes ? ` (${notes})` : ''}`,
        durationMinutes: duration,
        caloriesBurned: calories,
        steps: steps,
        completedAt: new Date().toISOString(),
        dateStr: TODAY_STR
      };

      state.workoutHistory.unshift(record);
      setData('workout_history', state.workoutHistory);

      activityLogForm.reset();
      closeModal('activity-log-modal');
      renderDashboard();
      renderWorkouts();
      checkBadges();
      showToast(`Logged ${duration} min of ${type}! 🔥 +${calories} kcal burned!`, 'success');
    });
  }

  // Meal Planner View Tabs
  const tabPlanner = document.getElementById('tab-btn-planner');
  const tabShopping = document.getElementById('tab-btn-shopping');
  const viewPlanner = document.getElementById('planner-calendar-view');
  const viewShopping = document.getElementById('planner-shopping-view');

  if (tabPlanner && tabShopping && viewPlanner && viewShopping) {
    tabPlanner.addEventListener('click', () => {
      tabPlanner.classList.add('active');
      tabShopping.classList.remove('active');
      viewPlanner.style.display = 'block';
      viewShopping.style.display = 'none';
    });
    tabShopping.addEventListener('click', () => {
      tabShopping.classList.add('active');
      tabPlanner.classList.remove('active');
      viewShopping.style.display = 'block';
      viewPlanner.style.display = 'none';
    });
  }

  // Planner day arrows
  const prevDayBtn = document.getElementById('planner-prev-day');
  const nextDayBtn = document.getElementById('planner-next-day');
  if (prevDayBtn && nextDayBtn) {
    prevDayBtn.addEventListener('click', () => {
      const idx = DAYS_OF_WEEK.findIndex(d => d.id === state.selectedPlannerDay);
      const nextIdx = (idx - 1 + DAYS_OF_WEEK.length) % DAYS_OF_WEEK.length;
      state.selectedPlannerDay = DAYS_OF_WEEK[nextIdx].id;
      renderPlannerDayPills();
      renderMealSlots();
      renderMacroTargetCard();
    });
    nextDayBtn.addEventListener('click', () => {
      const idx = DAYS_OF_WEEK.findIndex(d => d.id === state.selectedPlannerDay);
      const nextIdx = (idx + 1) % DAYS_OF_WEEK.length;
      state.selectedPlannerDay = DAYS_OF_WEEK[nextIdx].id;
      renderPlannerDayPills();
      renderMealSlots();
      renderMacroTargetCard();
    });
  }

  // Duplicate Day Modal
  const dupDayBtn = document.getElementById('duplicate-day-btn');
  if (dupDayBtn) {
    dupDayBtn.addEventListener('click', () => {
      document.getElementById('copy-from-day-text').textContent = state.selectedPlannerDay.toUpperCase();
      openModal('duplicate-day-modal');
    });
  }
  const confirmCopyBtn = document.getElementById('confirm-copy-day-btn');
  if (confirmCopyBtn) {
    confirmCopyBtn.addEventListener('click', () => {
      const target = document.getElementById('copy-target-day-select').value;
      duplicateCurrentDayPlan(target);
    });
  }
  const cancelCopyBtn = document.getElementById('cancel-copy-day-btn');
  const dupClose = document.getElementById('duplicate-modal-close');
  if (cancelCopyBtn) cancelCopyBtn.addEventListener('click', () => closeModal('duplicate-day-modal'));
  if (dupClose) dupClose.addEventListener('click', () => closeModal('duplicate-day-modal'));

  // Generate Shopping List button
  const genShoppingBtn = document.getElementById('generate-shopping-btn');
  if (genShoppingBtn) {
    genShoppingBtn.addEventListener('click', generateShoppingListFromPlan);
  }

  // Add Custom Shopping Item Form
  const addShopForm = document.getElementById('add-shopping-item-form');
  if (addShopForm) {
    addShopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custom-item-name').value.trim();
      const qty = document.getElementById('custom-item-qty').value.trim();
      const cat = document.getElementById('custom-item-cat').value;
      if (!name) return;

      state.shoppingList.push({
        id: 'shop_' + Date.now(),
        name,
        qty,
        category: cat,
        checked: false
      });
      setData('shopping_list', state.shoppingList);
      addShopForm.reset();
      renderShoppingList();
      showToast(`Added ${name} to shopping list!`, 'success');
    });
  }

  // Shopping List Actions
  const clearCheckedBtn = document.getElementById('clear-checked-shopping-btn');
  const clearAllShopBtn = document.getElementById('clear-all-shopping-btn');
  const printShoppingBtn = document.getElementById('print-shopping-btn');

  if (clearCheckedBtn) clearCheckedBtn.addEventListener('click', clearCheckedShoppingItems);
  if (clearAllShopBtn) clearAllShopBtn.addEventListener('click', clearAllShoppingItems);
  if (printShoppingBtn) {
    printShoppingBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Add Meal Modal Tabs (Choose Recipe vs Custom)
  const tabChoose = document.getElementById('tab-choose-recipe');
  const tabCustom = document.getElementById('tab-custom-meal');
  const panelChoose = document.getElementById('choose-recipe-panel');
  const formCustom = document.getElementById('quick-meal-form');

  if (tabChoose && tabCustom && panelChoose && formCustom) {
    tabChoose.addEventListener('click', () => {
      tabChoose.classList.add('active');
      tabCustom.classList.remove('active');
      panelChoose.style.display = 'block';
      formCustom.style.display = 'none';
    });
    tabCustom.addEventListener('click', () => {
      tabCustom.classList.add('active');
      tabChoose.classList.remove('active');
      formCustom.style.display = 'block';
      panelChoose.style.display = 'none';
    });
  }

  const plannerSearchInput = document.getElementById('planner-recipe-search');
  if (plannerSearchInput) {
    plannerSearchInput.addEventListener('input', (e) => {
      renderPlannerRecipePicker(e.target.value);
    });
  }

  if (formCustom) {
    formCustom.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('qm-name').value.trim();
      const cals = parseInt(document.getElementById('qm-calories').value, 10) || 400;
      const p = parseInt(document.getElementById('qm-protein').value, 10) || 0;
      const c = parseInt(document.getElementById('qm-carbs').value, 10) || 0;
      const f = parseInt(document.getElementById('qm-fat').value, 10) || 0;

      if (!state.mealPlan[state.selectedPlannerDay]) {
        state.mealPlan[state.selectedPlannerDay] = {};
      }
      if (!state.mealPlan[state.selectedPlannerDay][activeAddMealSlot]) {
        state.mealPlan[state.selectedPlannerDay][activeAddMealSlot] = [];
      }

      state.mealPlan[state.selectedPlannerDay][activeAddMealSlot].push({
        name,
        calories: cals,
        protein: p,
        carbs: c,
        fat: f
      });

      setData('meal_plan', state.mealPlan);
      formCustom.reset();
      closeModal('add-meal-modal');
      renderMealSlots();
      renderMacroTargetCard();
      showToast(`Added custom meal "${name}"!`, 'success');
    });
  }

  const addMealClose = document.getElementById('add-meal-close');
  if (addMealClose) addMealClose.addEventListener('click', () => closeModal('add-meal-modal'));

  // Nutrition Calculator Form
  const calcForm = document.getElementById('nutrition-calc-form');
  if (calcForm) calcForm.addEventListener('submit', calculateNutritionNeeds);

  // Food Substitutions Search
  const subSearchInput = document.getElementById('sub-search-input');
  if (subSearchInput) {
    subSearchInput.addEventListener('input', (e) => {
      renderFoodSubstitutions(e.target.value);
    });
  }

  initAccordion();
  renderFoodSubstitutions();

  // Wellness Journal Form
  const checkinForm = document.getElementById('daily-checkin-form');
  if (checkinForm) checkinForm.addEventListener('submit', saveDailyCheckIn);
  initJournal();

  // Blog Category Filter
  document.querySelectorAll('#blog-category-pills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#blog-category-pills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentBlogFilter = pill.getAttribute('data-bfilter');
      renderArticles();
    });
  });

  const articleModalClose = document.getElementById('article-modal-close');
  if (articleModalClose) articleModalClose.addEventListener('click', () => closeModal('article-modal'));

  // Custom Habit Modal
  const addHabitBtn = document.getElementById('add-custom-habit-btn');
  if (addHabitBtn) addHabitBtn.addEventListener('click', () => openModal('custom-habit-modal'));
  const customHabitClose = document.getElementById('custom-habit-close');
  const cancelHabitBtn = document.getElementById('cancel-habit-btn');
  if (customHabitClose) customHabitClose.addEventListener('click', () => closeModal('custom-habit-modal'));
  if (cancelHabitBtn) cancelHabitBtn.addEventListener('click', () => closeModal('custom-habit-modal'));

  const customHabitForm = document.getElementById('custom-habit-form');
  if (customHabitForm) customHabitForm.addEventListener('submit', handleCustomHabitSubmit);

  // Dashboard quick customize button
  const dashCustomizeBtn = document.getElementById('dashboard-customize-btn');
  if (dashCustomizeBtn) dashCustomizeBtn.addEventListener('click', openSettingsHandler);

  const dashRefreshBtn = document.getElementById('dashboard-today-refresh-btn');
  if (dashRefreshBtn) dashRefreshBtn.addEventListener('click', () => {
    renderDashboard();
    showToast('Dashboard metrics refreshed.', 'info');
  });

  const dashStartRecBtn = document.getElementById('dash-start-rec-workout-btn');
  if (dashStartRecBtn) {
    dashStartRecBtn.addEventListener('click', () => {
      startWorkoutSession('wo_2');
    });
  }

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const topic = document.getElementById('contact-topic').value;
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) return;

      contactForm.reset();
      showToast(`Thank you, ${name}! Hazr Studios has received your ${topic} note. 🌿`, 'success');
    });
  }

  // FAQ Accordion Listeners
  document.querySelectorAll('#faq-accordion .accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('#faq-accordion .accordion-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // Export Journal button
  const exportJournalBtn = document.getElementById('export-journal-btn');
  if (exportJournalBtn) {
    exportJournalBtn.addEventListener('click', () => {
      const entries = [];
      Object.keys(state.dailyLogs).forEach(d => {
        if (state.dailyLogs[d].journal) {
          entries.push({ date: d, ...state.dailyLogs[d].journal });
        }
      });
      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NutriFit_Journal_${TODAY_STR}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Journal logs exported.', 'success');
    });
  }

  // Initial renders
  renderDashboard();
  renderRecipes();
  renderRecentlyViewedRecipes();
  renderWorkouts();
  initMealPlanner();
  renderArticles();

  // Resize listener for Canvas chart responsiveness
  window.addEventListener('resize', () => {
    renderWeeklyChart();
  });
});

