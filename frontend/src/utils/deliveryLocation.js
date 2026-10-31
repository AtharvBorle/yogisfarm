/**
 * Delivery location verification utilities for Yogi's Farms.
 * Currently, deliveries are only supported within Pune city / PCMC metropolitan area.
 */

export const PUNE_DELIVERY_MESSAGE = `Thank you for visiting Yogi's Farms! Currently, we provide delivery services only within Pune city. Unfortunately, we are unable to accept or deliver orders outside Pune.

But don't worry! ❤️ We are working towards expanding our services and hope to serve you in your location very soon.`;

export const PUNE_DELIVERY_MESSAGE_PARAGRAPH_1 = "Thank you for visiting Yogi's Farms! Currently, we provide delivery services only within Pune city. Unfortunately, we are unable to accept or deliver orders outside Pune.";

export const PUNE_DELIVERY_MESSAGE_PARAGRAPH_2 = "But don't worry! ❤️ We are working towards expanding our services and hope to serve you in your location very soon.";

/**
 * Checks whether an address is within the serviceable Pune delivery area.
 * @param {Object} addr - Address object containing city, pincode, state, and address fields.
 * @returns {boolean} - True if address is in Pune, false otherwise.
 */
export const isPuneAddress = (addr) => {
    if (!addr) return false;

    const city = (addr.city || '').trim().toLowerCase();
    const pincode = String(addr.pincode || '').trim();
    const addressText = (addr.address || '').trim().toLowerCase();
    const state = (addr.state || '').trim().toLowerCase();

    // 1. Direct Pune city & twin-city (PCMC) keywords
    const puneKeywords = [
        'pune',
        'pimpri',
        'chinchwad',
        'pcmc',
        'pmc',
        'haveli',
        'khadki',
        'kirkee',
        'dehu road',
        'talegaon',
        'chakan',
        'wagholi',
        'hinjawadi',
        'hinjewadi',
        'hadapsar',
        'bhosari',
        'nigdi',
        'akurdi',
        'wakad',
        'kothrud',
        'baner',
        'aundh',
        'bavdhan',
        'pashan',
        'viman nagar',
        'kharadi',
        'magarpatta',
        'kondhwa',
        'katraj',
        'bibwewadi',
        'yerawada',
        'dhanori',
        'lohegaon',
        'undri',
        'pisoli',
        'fursungi',
        'phursungi',
        'manjri',
        'manjari'
    ];

    if (puneKeywords.some(keyword => city.includes(keyword))) {
        return true;
    }

    // 2. All 411xxx pincodes strictly belong to Pune city / PCMC (India Post Pune sorting division)
    if (/^411\d{3}$/.test(pincode)) {
        return true;
    }

    // 3. 412xxx pincodes (outer Pune district/suburban areas)
    if (/^412\d{3}$/.test(pincode)) {
        // Exclude major non-Pune cities that might have nearby prefixes
        const nonPuneCities = [
            'satara',
            'solapur',
            'ahmednagar',
            'ahmed nagar',
            'kolhapur',
            'sangli',
            'nashik',
            'mumbai',
            'thane',
            'raigad',
            'jalgaon',
            'dhule',
            'aurangabad',
            'chhatrapati sambhajinagar'
        ];
        const isNonPune = nonPuneCities.some(npc => city.includes(npc));
        if (!isNonPune) {
            return true;
        }
    }

    // 4. Fallback: if addressText mentions "pune" and city is either empty or matches Maharashtra
    if (addressText.includes('pune') && (!city || city === 'maharashtra')) {
        return true;
    }

    return false;
};
