const mongoose = require('mongoose');
require('dotenv').config();

const Gem = require('./models/Gem');
const User = require('./models/User');

const gemDefinitions = [
    {
        name: 'Emerald',
        hindiName: 'Panna (पन्ना)',
        alternateNames: ['Esmeralda (Spanish)'],
        planet: 'Mercury (Budh)',
        planetHindi: 'बुध ग्रह',
        color: 'Vibrant Green',
        description: 'Premium Colombian emerald with crisp clarity and deep green saturation. Traditionally worn to strengthen Mercury and sharpen intellect.',
        benefits: [
            'Strengthens Mercury for communication and intellect',
            'Supports business growth and negotiation skills',
            'Improves memory, focus, and analytical ability',
            'Promotes emotional balance and calmness'
        ],
        suitableFor: [
            'Gemini (Mithun)',
            'Virgo (Kanya)',
            'Writers & media professionals',
            'Stock traders and analysts',
            'Students preparing for competitive exams',
            'Entrepreneurs in communication industries'
        ],
        category: 'Emerald',
        price: 62000,
        discount: 5,
        discountType: 'percentage',
        sizeWeight: 5.4,
        sizeUnit: 'carat',
        stock: 12,
        availability: true,
        certification: 'IGI Certified',
        origin: 'Colombia',
        deliveryDays: 7,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/emerald/emerald_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/emerald/emerald_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/emerald/emerald_2.jpg'
        ],
        whomToUse: [
            'Gemini ascendant',
            'Virgo ascendant',
            'Business negotiators'
        ]
    },
    {
        name: 'Yellow Sapphire',
        hindiName: 'Pukhraj (पुखराज)',
        alternateNames: ['Yellow Corundum (Global Gem Trade)'],
        planet: 'Jupiter (Guru)',
        planetHindi: 'गुरु ग्रह',
        color: 'Golden Yellow',
        description: 'Rich golden-yellow sapphire known for attracting prosperity, wisdom, and spiritual growth. Favoured for strengthening Jupiter.',
        benefits: [
            'Enhances wisdom, ethics, and clarity of judgment',
            'Attracts prosperity and stable financial growth',
            'Supports marriages and harmonious family life',
            'Strengthens Jupiter for spiritual growth'
        ],
        suitableFor: [
            'Sagittarius (Dhanu)',
            'Pisces (Meen)',
            'Educators and counselors',
            'Financial advisors and bankers',
            'People seeking marital harmony',
            'Individuals in legal professions'
        ],
        category: 'Yellow Sapphire',
        price: 54000,
        discount: 8,
        discountType: 'percentage',
        sizeWeight: 4.8,
        sizeUnit: 'carat',
        stock: 14,
        availability: true,
        certification: 'GIA Certified',
        origin: 'Sri Lanka',
        deliveryDays: 6,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/yellow-sapphire/yellow_sapphire_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/yellow-sapphire/yellow_sapphire_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/yellow-sapphire/yellow_sapphire_2.jpg'
        ],
        whomToUse: [
            'Teachers and professors',
            'Spiritual practitioners',
            'Finance professionals'
        ]
    },
    {
        name: 'Blue Sapphire',
        hindiName: 'Neelam (नीलम)',
        alternateNames: ['Safir (Turkish markets)'],
        planet: 'Saturn (Shani)',
        planetHindi: 'शनि ग्रह',
        color: 'Royal Blue',
        description: 'Velvety royal blue sapphire renowned for Saturn strengthening, discipline, and swift transformation when astrologically suited.',
        benefits: [
            'Accelerates career growth and recognition',
            'Promotes discipline and structured thinking',
            'Offers protection from sudden losses',
            'Helps focus during long-term projects'
        ],
        suitableFor: [
            'Capricorn (Makar)',
            'Aquarius (Kumbh)',
            'IT and technology professionals',
            'Researchers and scientists',
            'Business leaders managing large teams',
            'People seeking stability and focus'
        ],
        category: 'Blue Sapphire',
        price: 88000,
        discount: 10,
        discountType: 'percentage',
        sizeWeight: 3.9,
        sizeUnit: 'carat',
        stock: 9,
        availability: true,
        certification: 'GII Certified',
        origin: 'Kashmir-inspired Sri Lankan mine',
        deliveryDays: 5,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/blue-sapphire/blue_sapphire_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/blue-sapphire/blue_sapphire_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/blue-sapphire/blue_sapphire_2.jpg'
        ],
        whomToUse: [
            'Saturn mahadasha natives',
            'Corporate strategists',
            'Engineers and architects'
        ]
    },
    {
        name: 'Ruby',
        hindiName: 'Manik (माणिक)',
        alternateNames: ['Rubis (French premium trade)'],
        planet: 'Sun (Surya)',
        planetHindi: 'सूर्य ग्रह',
        color: 'Pigeon Blood Red',
        description: 'Luxurious Burmese-style ruby symbolising authority, courage, and charisma. Ideal for fortifying Sun energies.',
        benefits: [
            'Boosts confidence and leadership presence',
            'Supports heart health and vitality',
            'Brings recognition, fame, and status',
            'Strengthens relationships with fatherly figures'
        ],
        suitableFor: [
            'Leo (Simha)',
            'Aries (Mesh)',
            'Executives and entrepreneurs',
            'Government officials',
            'Artists and performers',
            'Public speakers and influencers'
        ],
        category: 'Ruby',
        price: 99000,
        discount: 7,
        discountType: 'percentage',
        sizeWeight: 4.1,
        sizeUnit: 'carat',
        stock: 8,
        availability: true,
        certification: 'BIS Hallmark Lab',
        origin: 'Myanmar',
        deliveryDays: 5,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/ruby/ruby_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/ruby/ruby_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/ruby/ruby_2.jpg'
        ],
        whomToUse: [
            'Leaders and politicians',
            'Performing artists',
            'Sun mahadasha natives'
        ]
    },
    {
        name: 'Pearl',
        hindiName: 'Moti (मोती)',
        alternateNames: ['Perla (Spanish / Italian)'],
        planet: 'Moon (Chandra)',
        planetHindi: 'चंद्र ग्रह',
        color: 'Natural White with Silver Overtone',
        description: 'Cultured saltwater pearl that enhances emotional balance, patience, and intuition. Traditionally worn to calm the mind.',
        benefits: [
            'Promotes emotional stability and peace',
            'Enhances intuitive abilities and creativity',
            'Supports maternal and nurturing qualities',
            'Improves quality of sleep and calmness'
        ],
        suitableFor: [
            'Cancer (Kark)',
            'Pisces (Meen)',
            'Healers and therapists',
            'Artists and musicians',
            'New mothers',
            'Individuals with high anxiety'
        ],
        category: 'Pearl',
        price: 21000,
        discount: 0,
        discountType: 'percentage',
        sizeWeight: 7.5,
        sizeUnit: 'carat',
        stock: 20,
        availability: true,
        certification: 'IGL Certified',
        origin: 'Japan',
        deliveryDays: 9,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/pearl/pearl_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/pearl/pearl_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/pearl/pearl_2.jpg'
        ],
        whomToUse: [
            'Moon mahadasha natives',
            'Caregivers and counselors',
            'Creative professionals'
        ]
    },
    {
        name: 'Red Coral',
        hindiName: 'Moonga (मूंगा)',
        alternateNames: ['Corallo (Italian)'],
        planet: 'Mars (Mangal)',
        planetHindi: 'मंगल ग्रह',
        color: 'Rich Red',
        description: 'Mediterranean red coral polished to perfection, revered for boosting vitality, courage, and decisive action.',
        benefits: [
            'Energises physical stamina and courage',
            'Supports decisive action and confidence',
            'Protects against accidents and adversaries',
            'Balances Mars energy for strategic leadership'
        ],
        suitableFor: [
            'Aries (Mesh)',
            'Scorpio (Vrishchik)',
            'Defense and police personnel',
            'Athletes and sportspersons',
            'Surgeons and engineers',
            'Real estate professionals'
        ],
        category: 'Red Coral',
        price: 38000,
        discount: 4,
        discountType: 'percentage',
        sizeWeight: 6.3,
        sizeUnit: 'carat',
        stock: 16,
        availability: true,
        certification: 'Govt. Lab Certified',
        origin: 'Mediterranean Sea',
        deliveryDays: 8,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/red-coral/red_coral_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/red-coral/red_coral_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/red-coral/red_coral_2.jpg'
        ],
        whomToUse: [
            'Mars mahadasha natives',
            'Armed forces personnel',
            'Competitive professionals'
        ]
    },
    {
        name: 'Gomed (Hessonite)',
        hindiName: 'Gomed (गोमेद)',
        alternateNames: ['Cinnamon Stone (International trade name)'],
        planet: 'Rahu',
        planetHindi: 'राहु',
        color: 'Honey Brown',
        description: 'Honey-hued Hessonite garnet that calms Rahu influences and helps ground scattered ambitions into focus.',
        benefits: [
            'Stabilises sudden career fluctuations',
            'Helps deal with confusion and indecisiveness',
            'Provides protection from hidden enemies',
            'Promotes out-of-the-box thinking with grounding'
        ],
        suitableFor: [
            'Aquarius (Kumbh)',
            'Virgo (Kanya)',
            'Creative strategists',
            'Tech entrepreneurs',
            'People facing Rahu dosha',
            'Individuals in unconventional careers'
        ],
        category: 'Gomed',
        price: 29000,
        discount: 6,
        discountType: 'percentage',
        sizeWeight: 5.9,
        sizeUnit: 'carat',
        stock: 11,
        availability: true,
        certification: 'IGI Certified',
        origin: 'Sri Lanka',
        deliveryDays: 9,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/gomed/gomed_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/gomed/gomed_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/gomed/gomed_2.jpg'
        ],
        whomToUse: [
            'Rahu mahadasha natives',
            'Creative professionals',
            'People in technology start-ups'
        ]
    },
    {
        name: 'Diamond',
        hindiName: 'Heera (हीरा)',
        alternateNames: ['Diamant (French / German)'],
        planet: 'Venus (Shukra)',
        planetHindi: 'शुक्र ग्रह',
        color: 'Colorless',
        description: 'VS clarity round brilliant diamond that enhances luxury, charm, and artistic sensibilities linked with Venus.',
        benefits: [
            'Enhances charisma and personal magnetism',
            'Supports luxuries, beauty, and lifestyle upgrades',
            'Boosts artistic creativity and appreciation',
            'Strengthens relationships and partnerships'
        ],
        suitableFor: [
            'Libra (Tula)',
            'Taurus (Vrishabh)',
            'Artists and designers',
            'Luxury brand professionals',
            'Fashion and media personalities',
            'Individuals seeking Venus balance'
        ],
        category: 'Diamond',
        price: 145000,
        discount: 3,
        discountType: 'percentage',
        sizeWeight: 1.2,
        sizeUnit: 'carat',
        stock: 6,
        availability: true,
        certification: 'GIA Certified',
        origin: 'South Africa',
        deliveryDays: 4,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/diamond/diamond_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/diamond/diamond_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/diamond/diamond_2.jpg'
        ],
        whomToUse: [
            'Venus mahadasha natives',
            'Creative entrepreneurs',
            'Media professionals'
        ]
    },
    {
        name: "Cat's Eye (Chrysoberyl)",
        hindiName: 'Lehsunia (लहसुनिया)',
        alternateNames: ['Cymophane (Scientific name)'],
        planet: 'Ketu',
        planetHindi: 'केतु',
        color: 'Greenish Yellow with Silky Band',
        description: 'Natural Cat’s Eye with sharp chatoyancy, revered for protecting against unseen obstacles and stabilising Ketu energy.',
        benefits: [
            'Shields against sudden losses and mishaps',
            'Heightens spiritual insight and intuition',
            'Supports recovery from long illnesses',
            'Helps stabilise unpredictable life phases'
        ],
        suitableFor: [
            'Scorpio (Vrishchik)',
            'Sagittarius (Dhanu)',
            'Spiritual seekers',
            'Individuals facing Ketu dosha',
            'Researchers and occult practitioners',
            'People working in risk-prone sectors'
        ],
        category: "Cat's Eye",
        price: 33000,
        discount: 5,
        discountType: 'percentage',
        sizeWeight: 6.1,
        sizeUnit: 'carat',
        stock: 10,
        availability: true,
        certification: 'IGI Certified',
        origin: 'India',
        deliveryDays: 10,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/cats-eye/cats_eye_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/cats-eye/cats_eye_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/cats-eye/cats_eye_2.jpg'
        ],
        whomToUse: [
            'Ketu mahadasha natives',
            'Pilots and navigators',
            'Spiritual practitioners'
        ]
    },
    {
        name: 'Moonstone',
        hindiName: 'Chandrakant Mani (चंद्रकांत मणि)',
        alternateNames: ['Pierre de Lune (French)'],
        planet: 'Moon (Chandra)',
        planetHindi: 'चंद्र ग्रह',
        color: 'Milky White with Blue Schiller',
        description: 'Sri Lankan moonstone with luminous adularescence, cherished for emotional healing and feminine balance.',
        benefits: [
            'Balances emotions and hormonal cycles',
            'Encourages intuition and creativity',
            'Supports restful sleep and stress relief',
            'Brings serenity during major transitions'
        ],
        suitableFor: [
            'Cancer (Kark)',
            'Libra (Tula)',
            'Artists and healers',
            'Expectant mothers',
            'People experiencing mood swings',
            'Meditation practitioners'
        ],
        category: 'Moonstone',
        price: 26000,
        discount: 5,
        discountType: 'percentage',
        sizeWeight: 6.8,
        sizeUnit: 'carat',
        stock: 18,
        availability: true,
        certification: 'Govt. Lab Certified',
        origin: 'Sri Lanka',
        deliveryDays: 8,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/moonstone/moonstone_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/moonstone/moonstone_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/moonstone/moonstone_2.jpg'
        ],
        whomToUse: [
            'Moon remedial seekers',
            'Energy healers',
            'Creative writers'
        ]
    },
    {
        name: 'Turquoise',
        hindiName: 'Firoza ( फिरोज़ा )',
        alternateNames: ['Feroza (Persian trade name)'],
        planet: 'Jupiter (Guru)',
        planetHindi: 'गुरु ग्रह',
        color: 'Sky Blue with Matrix',
        description: 'Persian-style turquoise promoting protection, fortune, and spiritual upliftment. A global favourite for travel luck.',
        benefits: [
            'Protects travellers and globetrotters',
            'Attracts good fortune and social success',
            'Supports throat chakra and authentic speech',
            'Balances mood swings and stress'
        ],
        suitableFor: [
            'Sagittarius (Dhanu)',
            'Pisces (Meen)',
            'Travel professionals',
            'Public speakers',
            'Diplomats and negotiators',
            'People seeking protection charms'
        ],
        category: 'Turquoise',
        price: 32000,
        discount: 6,
        discountType: 'percentage',
        sizeWeight: 5.7,
        sizeUnit: 'carat',
        stock: 17,
        availability: true,
        certification: 'IGI Certified',
        origin: 'Iran',
        deliveryDays: 9,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/turquoise/turquoise_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/turquoise/turquoise_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/turquoise/turquoise_2.jpg'
        ],
        whomToUse: [
            'Travel bloggers',
            'Spiritual coaches',
            'Guru remedial practitioners'
        ]
    },
    {
        name: 'Opal',
        hindiName: 'Doodhiya Pathar (दूधिया पत्थर)',
        alternateNames: ['Opale (Italian / French)'],
        planet: 'Venus (Shukra)',
        planetHindi: 'शुक्र ग्रह',
        color: 'Milky White with Play-of-Colour',
        description: 'Australian white opal with vibrant play-of-colour, associated with creativity, luxury, and emotional release.',
        benefits: [
            'Ignites creativity and artistic expression',
            'Supports love, passion, and relationships',
            'Helps release emotional baggage compassionately',
            'Aligns with Venus for luxury and charm'
        ],
        suitableFor: [
            'Libra (Tula)',
            'Taurus (Vrishabh)',
            'Fashion designers',
            'Performing artists',
            'People seeking relationship harmony',
            'Individuals in marketing and media'
        ],
        category: 'Opal',
        price: 41000,
        discount: 9,
        discountType: 'percentage',
        sizeWeight: 4.5,
        sizeUnit: 'carat',
        stock: 13,
        availability: true,
        certification: 'IGL Certified',
        origin: 'Australia',
        deliveryDays: 7,
        heroImage: 'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/opal/opal_hero.jpg',
        additionalImages: [
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/opal/opal_1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1699999999/gems/opal/opal_2.jpg'
        ],
        whomToUse: [
            'Venus remedial seekers',
            'Creative professionals',
            'Relationship counselors'
        ]
    }
];

const connectToDatabase = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
};

const findOrCreateSeller = async () => {
    const sellerEmail = 'seller@gems.com';
    let seller = await User.findOne({ email: sellerEmail });

    if (seller) {
        if (seller.role !== 'seller') {
            seller.role = 'seller';
            await seller.save();
        }
        return seller;
    }

    console.log('Creating a default seller user...');
    seller = new User({
        name: 'Auralane Gems Seller',
        email: sellerEmail,
        password: '123456',
        role: 'seller',
        emailVerified: true
    });
    await seller.save();
    console.log('✅ Seller created with email:', sellerEmail);
    return seller;
};

const seedGems = async (seller) => {
    const createdGems = [];
    const skippedGems = [];

    for (const gemData of gemDefinitions) {
        const existingGem = await Gem.findOne({ name: gemData.name, seller: seller._id });
        if (existingGem) {
            skippedGems.push({ name: gemData.name, id: existingGem._id });
            continue;
        }

        const gemDocument = new Gem({
            ...gemData,
            category: gemData.category || gemData.name,
            seller: seller._id
        });

        await gemDocument.save();
        createdGems.push({ name: gemDocument.name, id: gemDocument._id });
    }

    return { createdGems, skippedGems };
};

const addDummyGems = async () => {
    try {
        await connectToDatabase();
        const seller = await findOrCreateSeller();
        console.log('Using seller ID:', seller._id.toString());

        const { createdGems, skippedGems } = await seedGems(seller);

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Gem Catalogue Seeding Summary');
        console.log('═══════════════════════════════════════');
        console.log('Seller Email :', seller.email);
        console.log('Seller Password (test use) : 123456');
        console.log('\n✅ Newly Added Gems:', createdGems.length);
        createdGems.forEach((gem, index) => {
            console.log(`${index + 1}. ${gem.name} (ID: ${gem.id})`);
        });

        console.log('\n⏭️  Gems Skipped (already exist):', skippedGems.length);
        skippedGems.forEach((gem, index) => {
            console.log(`${index + 1}. ${gem.name} (ID: ${gem.id})`);
        });
        console.log('═══════════════════════════════════════\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding dummy gems:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

addDummyGems();
