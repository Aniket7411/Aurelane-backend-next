const mongoose = require('mongoose');
require('dotenv').config();
const Gem = require('./models/Gem');
const User = require('./models/User');

// Gem data - 40 diverse gems across all categories
const gemsData = [
    // RUBY CATEGORY
    {
        name: "Burma Ruby",
        hindiName: "बर्मा माणिक",
        category: "Ruby",
        subcategory: "Burma Ruby",
        planet: "Sun (Surya Grah)",
        planetHindi: "सूर्य ग्रह",
        color: "Deep Red",
        description: "Premium quality Burma Ruby with excellent clarity and vibrant red color. Natural untreated gemstone perfect for Sun planet strengthening.",
        benefits: [
            "Enhances leadership qualities and authority",
            "Brings fame, recognition and success",
            "Improves self-confidence and willpower",
            "Strengthens Sun planet in horoscope",
            "Brings prosperity and wealth"
        ],
        suitableFor: ["Leaders", "Politicians", "CEOs", "Government officials", "Entrepreneurs"],
        birthMonth: "July",
        price: 125000,
        sizeWeight: 3.5,
        sizeUnit: "carat",
        stock: 8,
        certification: "IGI Certified",
        origin: "Myanmar (Burma)",
        deliveryDays: 10,
        heroImage: "https://via.placeholder.com/800x600/DC143C/FFFFFF?text=Burma+Ruby",
        additionalImages: [],
        alternateNames: ["Manik", "Manikya"],
        whomToUse: ["Leo zodiac", "Sun weak in horoscope"]
    },
    {
        name: "Tanzania Ruby",
        hindiName: "तंजानिया माणिक",
        category: "Ruby",
        subcategory: "Tanzania Ruby",
        planet: "Sun (Surya Grah)",
        planetHindi: "सूर्य ग्रह",
        color: "Bright Red",
        description: "Natural Tanzania Ruby with good clarity and attractive red hue. Excellent value for money.",
        benefits: [
            "Boosts confidence and self-esteem",
            "Attracts success and recognition",
            "Improves health and vitality",
            "Brings financial prosperity"
        ],
        suitableFor: ["Business owners", "Managers", "Professionals"],
        birthMonth: "July",
        price: 75000,
        sizeWeight: 4.0,
        sizeUnit: "carat",
        stock: 12,
        certification: "Govt. Lab Certified",
        origin: "Tanzania",
        deliveryDays: 7,
        heroImage: "https://via.placeholder.com/800x600/FF6347/FFFFFF?text=Tanzania+Ruby",
        additionalImages: [],
        alternateNames: ["Manik"],
        whomToUse: ["Sun weak", "Leadership roles"]
    },
    {
        name: "Thai Ruby",
        hindiName: "थाई माणिक",
        category: "Ruby",
        subcategory: "Thai Ruby",
        planet: "Sun (Surya Grah)",
        planetHindi: "सूर्य ग्रह",
        color: "Pinkish Red",
        description: "Beautiful Thai Ruby with good color saturation. Natural gemstone suitable for daily wear.",
        benefits: [
            "Enhances personal power",
            "Brings success in career",
            "Improves relationships",
            "Strengthens Sun energy"
        ],
        suitableFor: ["Executives", "Sales professionals", "Public speakers"],
        price: 55000,
        sizeWeight: 3.0,
        sizeUnit: "carat",
        stock: 15,
        certification: "Natural Gem Lab",
        origin: "Thailand",
        deliveryDays: 5,
        heroImage: "https://via.placeholder.com/800x600/FF1493/FFFFFF?text=Thai+Ruby",
        additionalImages: [],
        alternateNames: ["Manik"],
        whomToUse: ["Sun weak", "Career growth"]
    },

    // SAPPHIRE CATEGORY
    {
        name: "Kashmir Blue Sapphire",
        hindiName: "कश्मीर नीलम",
        category: "Sapphire",
        subcategory: "Kashmir Blue Sapphire",
        planet: "Saturn (Shani Grah)",
        planetHindi: "शनि ग्रह",
        color: "Cornflower Blue",
        description: "Rare and premium Kashmir Blue Sapphire with velvety blue color. The most sought-after sapphire variety.",
        benefits: [
            "Removes obstacles and delays",
            "Brings discipline and focus",
            "Protects from negative energies",
            "Strengthens Saturn planet",
            "Brings career stability"
        ],
        suitableFor: ["Professionals", "Students", "Business people", "Government employees"],
        birthMonth: "January",
        price: 200000,
        sizeWeight: 2.5,
        sizeUnit: "carat",
        stock: 3,
        certification: "GIA Certified",
        origin: "Kashmir, India",
        deliveryDays: 15,
        heroImage: "https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Kashmir+Sapphire",
        additionalImages: [],
        alternateNames: ["Neelam", "Indraneel"],
        whomToUse: ["Saturn weak", "Capricorn", "Aquarius"]
    },
    {
        name: "Ceylon Blue Sapphire",
        hindiName: "सीलोन नीलम",
        category: "Sapphire",
        subcategory: "Ceylon Blue Sapphire",
        planet: "Saturn (Shani Grah)",
        planetHindi: "शनि ग्रह",
        color: "Royal Blue",
        description: "Premium Ceylon Blue Sapphire with excellent clarity and rich blue color. Natural untreated gemstone.",
        benefits: [
            "Removes Saturn dosha",
            "Brings mental peace",
            "Improves concentration",
            "Attracts wealth and prosperity"
        ],
        suitableFor: ["Professionals", "Students", "Meditators"],
        birthMonth: "January",
        price: 95000,
        sizeWeight: 3.0,
        sizeUnit: "carat",
        stock: 10,
        certification: "IGI Certified",
        origin: "Sri Lanka",
        deliveryDays: 8,
        heroImage: "https://via.placeholder.com/800x600/4169E1/FFFFFF?text=Ceylon+Sapphire",
        additionalImages: [],
        alternateNames: ["Neelam"],
        whomToUse: ["Saturn weak", "Career obstacles"]
    },
    {
        name: "Yellow Sapphire",
        hindiName: "पुखराज",
        category: "Sapphire",
        subcategory: "Yellow Sapphire",
        planet: "Jupiter (Guru Grah)",
        planetHindi: "गुरु ग्रह",
        color: "Golden Yellow",
        description: "Natural Yellow Sapphire (Pukhraj) with beautiful golden yellow color. Perfect for Jupiter planet strengthening.",
        benefits: [
            "Brings wisdom and knowledge",
            "Attracts wealth and prosperity",
            "Improves relationships and marriage",
            "Strengthens Jupiter planet",
            "Brings good fortune"
        ],
        suitableFor: ["Teachers", "Students", "Business people", "Married couples"],
        birthMonth: "November",
        price: 85000,
        sizeWeight: 5.0,
        sizeUnit: "carat",
        stock: 12,
        certification: "Govt. Lab Certified",
        origin: "Sri Lanka",
        deliveryDays: 7,
        heroImage: "https://via.placeholder.com/800x600/FFD700/000000?text=Yellow+Sapphire",
        additionalImages: [],
        alternateNames: ["Pukhraj", "Pushparagam"],
        whomToUse: ["Jupiter weak", "Sagittarius", "Pisces"]
    },
    {
        name: "White Sapphire",
        hindiName: "सफेद नीलम",
        category: "Sapphire",
        subcategory: "White Sapphire",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Colorless",
        description: "Natural White Sapphire with excellent clarity and brilliance. Alternative to diamond with astrological benefits.",
        benefits: [
            "Enhances creativity and art",
            "Brings luxury and comfort",
            "Improves relationships",
            "Strengthens Venus planet"
        ],
        suitableFor: ["Artists", "Designers", "Musicians", "Fashion professionals"],
        birthMonth: "October",
        price: 45000,
        sizeWeight: 4.5,
        sizeUnit: "carat",
        stock: 18,
        certification: "Natural Gem Lab",
        origin: "Sri Lanka",
        deliveryDays: 6,
        heroImage: "https://via.placeholder.com/800x600/F5F5F5/000000?text=White+Sapphire",
        additionalImages: [],
        alternateNames: ["Safed Neelam"],
        whomToUse: ["Venus weak", "Libra", "Taurus"]
    },
    {
        name: "Pink Sapphire",
        hindiName: "गुलाबी नीलम",
        category: "Sapphire",
        subcategory: "Pink Sapphire",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Pink",
        description: "Beautiful Pink Sapphire with soft pink hue. Natural gemstone perfect for love and relationships.",
        benefits: [
            "Enhances love and romance",
            "Improves relationships",
            "Brings harmony in marriage",
            "Strengthens Venus energy"
        ],
        suitableFor: ["Couples", "Artists", "Fashion designers"],
        price: 65000,
        sizeWeight: 3.5,
        sizeUnit: "carat",
        stock: 14,
        certification: "IGI Certified",
        origin: "Madagascar",
        deliveryDays: 7,
        heroImage: "https://via.placeholder.com/800x600/FFB6C1/000000?text=Pink+Sapphire",
        additionalImages: [],
        alternateNames: ["Gulabi Neelam"],
        whomToUse: ["Venus weak", "Love life"]
    },

    // EMERALD CATEGORY
    {
        name: "Zambian Emerald",
        hindiName: "जाम्बिया पन्ना",
        category: "Emerald",
        subcategory: "Zambian Emerald",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Deep Green",
        description: "Premium Zambian Emerald with rich green color and good clarity. Natural untreated gemstone.",
        benefits: [
            "Enhances intelligence and communication",
            "Improves business acumen",
            "Brings mental clarity",
            "Strengthens Mercury planet",
            "Improves memory and learning"
        ],
        suitableFor: ["Students", "Teachers", "Business people", "Writers", "Lawyers"],
        birthMonth: "May",
        price: 110000,
        sizeWeight: 4.0,
        sizeUnit: "carat",
        stock: 7,
        certification: "GIA Certified",
        origin: "Zambia",
        deliveryDays: 12,
        heroImage: "https://via.placeholder.com/800x600/008000/FFFFFF?text=Zambian+Emerald",
        additionalImages: [],
        alternateNames: ["Panna", "Marakata"],
        whomToUse: ["Mercury weak", "Gemini", "Virgo"]
    },
    {
        name: "Colombian Emerald",
        hindiName: "कोलंबिया पन्ना",
        category: "Emerald",
        subcategory: "Colombian Emerald",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Vivid Green",
        description: "Rare Colombian Emerald with exceptional color and clarity. The finest emerald variety available.",
        benefits: [
            "Boosts intelligence and wisdom",
            "Enhances communication skills",
            "Brings success in education",
            "Improves analytical abilities"
        ],
        suitableFor: ["Students", "Researchers", "Scientists", "Academics"],
        birthMonth: "May",
        price: 180000,
        sizeWeight: 3.0,
        sizeUnit: "carat",
        stock: 4,
        certification: "GIA Certified",
        origin: "Colombia",
        deliveryDays: 15,
        heroImage: "https://via.placeholder.com/800x600/228B22/FFFFFF?text=Colombian+Emerald",
        additionalImages: [],
        alternateNames: ["Panna"],
        whomToUse: ["Mercury weak", "Education"]
    },
    {
        name: "Brazilian Emerald",
        hindiName: "ब्राजील पन्ना",
        category: "Emerald",
        subcategory: "Brazilian Emerald",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Green",
        description: "Natural Brazilian Emerald with good color and clarity. Excellent value for money.",
        benefits: [
            "Improves memory and focus",
            "Enhances learning ability",
            "Brings mental peace",
            "Strengthens Mercury energy"
        ],
        suitableFor: ["Students", "Professionals", "Business people"],
        price: 70000,
        sizeWeight: 5.0,
        sizeUnit: "carat",
        stock: 11,
        certification: "Govt. Lab Certified",
        origin: "Brazil",
        deliveryDays: 8,
        heroImage: "https://via.placeholder.com/800x600/32CD32/000000?text=Brazilian+Emerald",
        additionalImages: [],
        alternateNames: ["Panna"],
        whomToUse: ["Mercury weak", "Intelligence"]
    },

    // DIAMOND CATEGORY
    {
        name: "Natural Diamond",
        hindiName: "हीरा",
        category: "Diamond",
        subcategory: "Natural Diamond",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Colorless",
        description: "Premium natural diamond with excellent cut, clarity and color. Perfect for engagement rings and jewelry.",
        benefits: [
            "Brings luxury and prosperity",
            "Enhances beauty and charm",
            "Improves relationships",
            "Strengthens Venus planet",
            "Brings success and fame"
        ],
        suitableFor: ["Brides", "Jewelry lovers", "Artists", "Fashion professionals"],
        birthMonth: "October",
        price: 250000,
        sizeWeight: 1.0,
        sizeUnit: "carat",
        stock: 5,
        certification: "GIA Certified",
        origin: "South Africa",
        deliveryDays: 20,
        heroImage: "https://via.placeholder.com/800x600/E6E6FA/000000?text=Natural+Diamond",
        additionalImages: [],
        alternateNames: ["Heera", "Vajra"],
        whomToUse: ["Venus weak", "Luxury", "Marriage"]
    },
    {
        name: "Lab Grown Diamond",
        hindiName: "लेब ग्रोन हीरा",
        category: "Diamond",
        subcategory: "Lab Grown Diamond",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Colorless",
        description: "Ethical lab grown diamond with same properties as natural diamond. Environmentally friendly option.",
        benefits: [
            "Brings prosperity and wealth",
            "Enhances beauty and elegance",
            "Improves relationships",
            "Affordable luxury option"
        ],
        suitableFor: ["Modern couples", "Ethical buyers", "Jewelry enthusiasts"],
        price: 120000,
        sizeWeight: 1.5,
        sizeUnit: "carat",
        stock: 20,
        certification: "IGI Certified",
        origin: "Lab Grown",
        deliveryDays: 10,
        heroImage: "https://via.placeholder.com/800x600/F0F8FF/000000?text=Lab+Diamond",
        additionalImages: [],
        alternateNames: ["Lab Heera"],
        whomToUse: ["Venus weak", "Modern jewelry"]
    },

    // PEARL CATEGORY
    {
        name: "South Sea Pearl",
        hindiName: "दक्षिण सागर मोती",
        category: "Pearl",
        subcategory: "South Sea Pearl",
        planet: "Moon (Chandra Grah)",
        planetHindi: "चंद्र ग्रह",
        color: "White",
        description: "Premium South Sea Pearl with excellent luster and round shape. Natural cultured pearl.",
        benefits: [
            "Brings mental peace and calmness",
            "Enhances emotional stability",
            "Improves relationships",
            "Strengthens Moon planet",
            "Brings prosperity"
        ],
        suitableFor: ["Women", "Emotional healing", "Marriage", "Relationships"],
        birthMonth: "June",
        price: 95000,
        sizeWeight: 8.0,
        sizeUnit: "gram",
        stock: 9,
        certification: "Pearl Certification",
        origin: "South Pacific",
        deliveryDays: 8,
        heroImage: "https://via.placeholder.com/800x600/FFF8DC/000000?text=South+Sea+Pearl",
        additionalImages: [],
        alternateNames: ["Moti", "Mukta"],
        whomToUse: ["Moon weak", "Cancer", "Emotional balance"]
    },
    {
        name: "Tahitian Black Pearl",
        hindiName: "ताहिती काला मोती",
        category: "Pearl",
        subcategory: "Tahitian Black Pearl",
        planet: "Moon (Chandra Grah)",
        planetHindi: "चंद्र ग्रह",
        color: "Black",
        description: "Exotic Tahitian Black Pearl with unique dark color and excellent luster. Rare and beautiful.",
        benefits: [
            "Brings emotional strength",
            "Enhances intuition",
            "Protects from negative energies",
            "Strengthens Moon energy"
        ],
        suitableFor: ["Unique jewelry", "Fashion forward", "Collectors"],
        price: 125000,
        sizeWeight: 10.0,
        sizeUnit: "gram",
        stock: 6,
        certification: "Pearl Certification",
        origin: "Tahiti",
        deliveryDays: 12,
        heroImage: "https://via.placeholder.com/800x600/2F2F2F/FFFFFF?text=Tahitian+Pearl",
        additionalImages: [],
        alternateNames: ["Kala Moti"],
        whomToUse: ["Moon weak", "Unique style"]
    },
    {
        name: "Freshwater Pearl",
        hindiName: "मीठे पानी का मोती",
        category: "Pearl",
        subcategory: "Freshwater Pearl",
        planet: "Moon (Chandra Grah)",
        planetHindi: "चंद्र ग्रह",
        color: "White",
        description: "Natural Freshwater Pearl with good luster. Affordable and beautiful option for daily wear.",
        benefits: [
            "Brings peace and harmony",
            "Improves emotional well-being",
            "Enhances relationships",
            "Brings prosperity"
        ],
        suitableFor: ["Daily wear", "Budget conscious", "Traditional jewelry"],
        price: 35000,
        sizeWeight: 6.0,
        sizeUnit: "gram",
        stock: 25,
        certification: "Natural Pearl",
        origin: "China",
        deliveryDays: 5,
        heroImage: "https://via.placeholder.com/800x600/FFFAF0/000000?text=Freshwater+Pearl",
        additionalImages: [],
        alternateNames: ["Moti"],
        whomToUse: ["Moon weak", "Daily wear"]
    },

    // CORAL CATEGORY
    {
        name: "Red Coral",
        hindiName: "लाल मूंगा",
        category: "Coral",
        subcategory: "Red Coral",
        planet: "Mars (Mangal Grah)",
        planetHindi: "मंगल ग्रह",
        color: "Red",
        description: "Natural Red Coral (Moonga) with vibrant red color. Perfect for Mars planet strengthening.",
        benefits: [
            "Enhances courage and confidence",
            "Brings success in competitive fields",
            "Improves physical strength",
            "Strengthens Mars planet",
            "Removes Mangal dosha"
        ],
        suitableFor: ["Athletes", "Soldiers", "Engineers", "Surgeons", "Competitive professionals"],
        birthMonth: "March",
        price: 45000,
        sizeWeight: 8.0,
        sizeUnit: "gram",
        stock: 15,
        certification: "Natural Coral",
        origin: "Mediterranean",
        deliveryDays: 7,
        heroImage: "https://via.placeholder.com/800x600/DC143C/FFFFFF?text=Red+Coral",
        additionalImages: [],
        alternateNames: ["Moonga", "Praval"],
        whomToUse: ["Mars weak", "Aries", "Scorpio", "Mangal dosha"]
    },
    {
        name: "Pink Coral",
        hindiName: "गुलाबी मूंगा",
        category: "Coral",
        subcategory: "Pink Coral",
        planet: "Mars (Mangal Grah)",
        planetHindi: "मंगल ग्रह",
        color: "Pink",
        description: "Natural Pink Coral with soft pink hue. Gentle option for Mars planet strengthening.",
        benefits: [
            "Brings courage and strength",
            "Improves energy levels",
            "Enhances leadership",
            "Strengthens Mars energy"
        ],
        suitableFor: ["Women", "Gentle Mars remedy", "Leadership roles"],
        price: 38000,
        sizeWeight: 7.0,
        sizeUnit: "gram",
        stock: 18,
        certification: "Natural Coral",
        origin: "Mediterranean",
        deliveryDays: 6,
        heroImage: "https://via.placeholder.com/800x600/FFB6C1/000000?text=Pink+Coral",
        additionalImages: [],
        alternateNames: ["Gulabi Moonga"],
        whomToUse: ["Mars weak", "Gentle remedy"]
    },

    // TOPAZ & QUARTZ CATEGORY
    {
        name: "Blue Topaz",
        hindiName: "नीला टोपाज",
        category: "Topaz & Quartz",
        subcategory: "Blue Topaz",
        planet: "Saturn (Shani Grah)",
        planetHindi: "शनि ग्रह",
        color: "Blue",
        description: "Natural Blue Topaz with beautiful sky blue color. Affordable alternative to blue sapphire.",
        benefits: [
            "Brings mental clarity",
            "Improves communication",
            "Enhances creativity",
            "Brings peace and calm"
        ],
        suitableFor: ["Students", "Artists", "Writers", "Professionals"],
        price: 25000,
        sizeWeight: 6.0,
        sizeUnit: "carat",
        stock: 22,
        certification: "Natural Gem Lab",
        origin: "Brazil",
        deliveryDays: 5,
        heroImage: "https://via.placeholder.com/800x600/87CEEB/000000?text=Blue+Topaz",
        additionalImages: [],
        alternateNames: ["Neela Topaz"],
        whomToUse: ["Saturn weak", "Budget option"]
    },
    {
        name: "Citrine",
        hindiName: "सिट्रिन",
        category: "Topaz & Quartz",
        subcategory: "Citrine",
        planet: "Sun (Surya Grah)",
        planetHindi: "सूर्य ग्रह",
        color: "Yellow",
        description: "Natural Citrine with warm yellow color. Affordable alternative to yellow sapphire.",
        benefits: [
            "Brings prosperity and wealth",
            "Enhances confidence",
            "Improves business success",
            "Brings positive energy"
        ],
        suitableFor: ["Business owners", "Entrepreneurs", "Sales professionals"],
        price: 18000,
        sizeWeight: 8.0,
        sizeUnit: "carat",
        stock: 30,
        certification: "Natural Gem Lab",
        origin: "Brazil",
        deliveryDays: 4,
        heroImage: "https://via.placeholder.com/800x600/FFD700/000000?text=Citrine",
        additionalImages: [],
        alternateNames: ["Sunela"],
        whomToUse: ["Sun weak", "Wealth"]
    },
    {
        name: "Amethyst",
        hindiName: "अमेथिस्ट",
        category: "Topaz & Quartz",
        subcategory: "Amethyst",
        planet: "Saturn (Shani Grah)",
        planetHindi: "शनि ग्रह",
        color: "Purple",
        description: "Natural Amethyst with rich purple color. Beautiful and affordable gemstone for spiritual growth.",
        benefits: [
            "Brings spiritual growth",
            "Enhances intuition",
            "Brings peace and calm",
            "Protects from negative energies"
        ],
        suitableFor: ["Spiritual seekers", "Meditators", "Healers"],
        price: 15000,
        sizeWeight: 10.0,
        sizeUnit: "carat",
        stock: 35,
        certification: "Natural Gem Lab",
        origin: "Brazil",
        deliveryDays: 4,
        heroImage: "https://via.placeholder.com/800x600/9966CC/FFFFFF?text=Amethyst",
        additionalImages: [],
        alternateNames: ["Jamunia"],
        whomToUse: ["Saturn weak", "Spirituality"]
    },
    {
        name: "Rose Quartz",
        hindiName: "गुलाबी क्वार्ट्ज",
        category: "Topaz & Quartz",
        subcategory: "Rose Quartz",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Pink",
        description: "Natural Rose Quartz with soft pink color. Stone of love and relationships.",
        benefits: [
            "Enhances love and relationships",
            "Brings emotional healing",
            "Improves self-love",
            "Brings harmony"
        ],
        suitableFor: ["Couples", "Emotional healing", "Love seekers"],
        price: 12000,
        sizeWeight: 12.0,
        sizeUnit: "carat",
        stock: 40,
        certification: "Natural Gem Lab",
        origin: "Brazil",
        deliveryDays: 3,
        heroImage: "https://via.placeholder.com/800x600/FFB6C1/000000?text=Rose+Quartz",
        additionalImages: [],
        alternateNames: ["Gulabi Quartz"],
        whomToUse: ["Venus weak", "Love"]
    },

    // OPAL & EXOTIC CATEGORY
    {
        name: "Australian Opal",
        hindiName: "ऑस्ट्रेलिया ओपल",
        category: "Opal & Exotic",
        subcategory: "Australian Opal",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Multi-color",
        description: "Premium Australian Opal with beautiful play of colors. Unique and exotic gemstone.",
        benefits: [
            "Enhances creativity",
            "Brings inspiration",
            "Improves relationships",
            "Brings good fortune"
        ],
        suitableFor: ["Artists", "Creative professionals", "Collectors"],
        price: 85000,
        sizeWeight: 5.0,
        sizeUnit: "carat",
        stock: 8,
        certification: "GIA Certified",
        origin: "Australia",
        deliveryDays: 10,
        heroImage: "https://via.placeholder.com/800x600/FFD700/000000?text=Australian+Opal",
        additionalImages: [],
        alternateNames: ["Opal"],
        whomToUse: ["Venus weak", "Creativity"]
    },
    {
        name: "Tanzanite",
        hindiName: "टैंजानाइट",
        category: "Opal & Exotic",
        subcategory: "Tanzanite",
        planet: "Saturn (Shani Grah)",
        planetHindi: "शनि ग्रह",
        color: "Blue-Violet",
        description: "Rare Tanzanite with beautiful blue-violet color. Found only in Tanzania, very limited supply.",
        benefits: [
            "Brings transformation",
            "Enhances spiritual growth",
            "Brings peace and harmony",
            "Protects from negative energies"
        ],
        suitableFor: ["Collectors", "Unique jewelry", "Spiritual seekers"],
        price: 150000,
        sizeWeight: 3.0,
        sizeUnit: "carat",
        stock: 5,
        certification: "GIA Certified",
        origin: "Tanzania",
        deliveryDays: 14,
        heroImage: "https://via.placeholder.com/800x600/483D8B/FFFFFF?text=Tanzanite",
        additionalImages: [],
        alternateNames: ["Tanzanite"],
        whomToUse: ["Saturn weak", "Rare gem"]
    },
    {
        name: "Peridot",
        hindiName: "पेरिडोट",
        category: "Opal & Exotic",
        subcategory: "Peridot",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Green",
        description: "Natural Peridot with vibrant green color. Beautiful and affordable green gemstone.",
        benefits: [
            "Enhances intelligence",
            "Brings prosperity",
            "Improves relationships",
            "Brings positive energy"
        ],
        suitableFor: ["Students", "Professionals", "Business people"],
        price: 28000,
        sizeWeight: 7.0,
        sizeUnit: "carat",
        stock: 20,
        certification: "Natural Gem Lab",
        origin: "Pakistan",
        deliveryDays: 6,
        heroImage: "https://via.placeholder.com/800x600/50C878/000000?text=Peridot",
        additionalImages: [],
        alternateNames: ["Peridot"],
        whomToUse: ["Mercury weak", "Green gem"]
    },

    // CAT'S EYE & HESSONITE CATEGORY
    {
        name: "Cat's Eye",
        hindiName: "लेहसुनिया",
        category: "Cat's Eye & Hessonite",
        subcategory: "Cat's Eye",
        planet: "Ketu (Ketu Grah)",
        planetHindi: "केतु ग्रह",
        color: "Honey Yellow",
        description: "Natural Cat's Eye (Lehsunia) with sharp chatoyancy effect. Perfect for Ketu planet strengthening.",
        benefits: [
            "Removes Ketu dosha",
            "Brings spiritual growth",
            "Enhances intuition",
            "Protects from negative energies",
            "Brings moksha"
        ],
        suitableFor: ["Spiritual seekers", "Meditators", "Yogis"],
        price: 65000,
        sizeWeight: 4.5,
        sizeUnit: "carat",
        stock: 10,
        certification: "Govt. Lab Certified",
        origin: "Sri Lanka",
        deliveryDays: 8,
        heroImage: "https://via.placeholder.com/800x600/DAA520/000000?text=Cat's+Eye",
        additionalImages: [],
        alternateNames: ["Lehsunia", "Vaidurya"],
        whomToUse: ["Ketu weak", "Spiritual growth"]
    },
    {
        name: "Hessonite",
        hindiName: "गोमेद",
        category: "Cat's Eye & Hessonite",
        subcategory: "Hessonite",
        planet: "Rahu (Rahu Grah)",
        planetHindi: "राहु ग्रह",
        color: "Orange-Brown",
        description: "Natural Hessonite (Gomed) with orange-brown color. Perfect for Rahu planet strengthening.",
        benefits: [
            "Removes Rahu dosha",
            "Brings success and fame",
            "Enhances intelligence",
            "Protects from negative energies",
            "Brings material prosperity"
        ],
        suitableFor: ["Professionals", "Business people", "Students"],
        price: 55000,
        sizeWeight: 5.0,
        sizeUnit: "carat",
        stock: 12,
        certification: "Govt. Lab Certified",
        origin: "Sri Lanka",
        deliveryDays: 7,
        heroImage: "https://via.placeholder.com/800x600/CD853F/FFFFFF?text=Hessonite",
        additionalImages: [],
        alternateNames: ["Gomed", "Gomedh"],
        whomToUse: ["Rahu weak", "Success"]
    },

    // ALEXANDRITE CATEGORY
    {
        name: "Natural Alexandrite",
        hindiName: "अलेक्जेंड्राइट",
        category: "Alexandrite",
        subcategory: "Natural Alexandrite",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Color Change (Green to Red)",
        description: "Rare Natural Alexandrite with color change effect. Changes from green in daylight to red in incandescent light.",
        benefits: [
            "Enhances intelligence",
            "Brings good fortune",
            "Improves creativity",
            "Brings balance in life"
        ],
        suitableFor: ["Collectors", "Unique jewelry", "Gem enthusiasts"],
        price: 220000,
        sizeWeight: 2.0,
        sizeUnit: "carat",
        stock: 3,
        certification: "GIA Certified",
        origin: "Russia",
        deliveryDays: 20,
        heroImage: "https://via.placeholder.com/800x600/00FF00/000000?text=Alexandrite",
        additionalImages: [],
        alternateNames: ["Alexandrite"],
        whomToUse: ["Mercury weak", "Rare gem"]
    },
    {
        name: "Lab Alexandrite",
        hindiName: "लेब अलेक्जेंड्राइट",
        category: "Alexandrite",
        subcategory: "Lab Alexandrite",
        planet: "Mercury (Budh Grah)",
        planetHindi: "बुध ग्रह",
        color: "Color Change (Green to Red)",
        description: "Lab created Alexandrite with same color change properties as natural. More affordable option.",
        benefits: [
            "Enhances intelligence",
            "Brings prosperity",
            "Improves communication",
            "Affordable color change gem"
        ],
        suitableFor: ["Budget conscious", "Color change lovers"],
        price: 45000,
        sizeWeight: 3.0,
        sizeUnit: "carat",
        stock: 15,
        certification: "Lab Created",
        origin: "Lab Grown",
        deliveryDays: 8,
        heroImage: "https://via.placeholder.com/800x600/32CD32/FFFFFF?text=Lab+Alexandrite",
        additionalImages: [],
        alternateNames: ["Lab Alexandrite"],
        whomToUse: ["Mercury weak", "Budget option"]
    },

    // CUSTOM CATEGORY
    {
        name: "Custom Gemstone Set",
        hindiName: "कस्टम रत्न सेट",
        category: "Custom",
        subcategory: "Navratna Set",
        planet: "All Planets",
        planetHindi: "सभी ग्रह",
        color: "Multi-color",
        description: "Custom Navratna (Nine Gem) set with all nine planetary gemstones. Complete astrological remedy.",
        benefits: [
            "Balances all planets",
            "Brings overall prosperity",
            "Enhances all aspects of life",
            "Complete astrological solution"
        ],
        suitableFor: ["Complete remedy", "All zodiac signs", "Comprehensive solution"],
        price: 500000,
        sizeWeight: 1.0,
        sizeUnit: "carat",
        stock: 2,
        certification: "Custom Set",
        origin: "Multiple Origins",
        deliveryDays: 30,
        heroImage: "https://via.placeholder.com/800x600/FFD700/000000?text=Navratna+Set",
        additionalImages: [],
        alternateNames: ["Navratna", "Nine Gem Set"],
        whomToUse: ["All planets", "Complete remedy"]
    },
    {
        name: "Custom Engagement Ring",
        hindiName: "कस्टम एंगेजमेंट रिंग",
        category: "Custom",
        subcategory: "Custom Ring",
        planet: "Venus (Shukra Grah)",
        planetHindi: "शुक्र ग्रह",
        color: "Custom",
        description: "Custom designed engagement ring with your choice of gemstone and setting. Made to order.",
        benefits: [
            "Personalized jewelry",
            "Unique design",
            "Perfect for special occasions",
            "Made to your specifications"
        ],
        suitableFor: ["Engagements", "Special occasions", "Personalized gifts"],
        contactForPrice: true,
        price: null,
        sizeWeight: 1.0,
        sizeUnit: "carat",
        stock: 0,
        certification: "Custom Made",
        origin: "Made to Order",
        deliveryDays: 45,
        heroImage: "https://via.placeholder.com/800x600/FF69B4/FFFFFF?text=Custom+Ring",
        additionalImages: [],
        alternateNames: ["Custom Ring"],
        whomToUse: ["Special occasions"]
    }
];

// Connect to MongoDB and add gems
const addGems = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel_backend';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Find seller by email
        // Note: Email provided was "johnaniket@72311@gmail.com" - fixing to "johnaniket72311@gmail.com"
        // If the actual email is different, please update this
        const sellerEmail = 'johnaniket72311@gmail.com';
        const seller = await User.findOne({ email: sellerEmail.toLowerCase() });

        if (!seller) {
            console.error('❌ Seller not found with email:', sellerEmail);
            console.log('💡 Please make sure the seller account exists and email is correct.');
            process.exit(1);
        }

        if (seller.role !== 'seller') {
            console.error('❌ User found but role is not "seller". Current role:', seller.role);
            console.log('💡 Please update the user role to "seller" first.');
            process.exit(1);
        }

        console.log(`✅ Found seller: ${seller.name} (${seller.email})`);
        console.log(`📦 Adding ${gemsData.length} gems...\n`);

        let successCount = 0;
        let errorCount = 0;

        // Add each gem
        for (const gemData of gemsData) {
            try {
                // Add seller reference
                const gemToCreate = {
                    ...gemData,
                    seller: seller._id,
                    availability: gemData.stock > 0,
                    images: gemData.additionalImages || [],
                    allImages: gemData.additionalImages || []
                };

                // Create gem
                const gem = new Gem(gemToCreate);
                await gem.save();

                successCount++;
                console.log(`✅ Added: ${gem.name} (${gem.category})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Error adding ${gemData.name}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ Successfully added: ${successCount} gems`);
        if (errorCount > 0) {
            console.log(`❌ Failed to add: ${errorCount} gems`);
        }
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the script
addGems();

