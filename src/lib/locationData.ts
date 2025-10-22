// Comprehensive location data for Kenya counties, constituencies, and wards
// For Nairobi, Kiambu, Kajiado, and Machakos counties, we collect wards
// For all other counties, we only collect constituencies

export interface Ward {
  name: string;
}

export interface Constituency {
  name: string;
  wards: Ward[];
}

export interface County {
  name: string;
  constituencies: Constituency[];
  hasWards: boolean; // true for Nairobi, Kiambu, Kajiado, Machakos
}

export const locationData: County[] = [
  {
    name: "Nairobi County",
    hasWards: true,
    constituencies: [
      {
        name: "Westlands",
        wards: [
          { name: "Kitisuru" },
          { name: "Parklands/Highridge" },
          { name: "Karura" },
          { name: "Kangemi" },
          { name: "Mountain View" }
        ]
      },
      {
        name: "Dagoretti North",
        wards: [
          { name: "Kilimani" },
          { name: "Kawangware" },
          { name: "Gatina" },
          { name: "Kileleshwa" },
          { name: "Kabiro" }
        ]
      },
      {
        name: "Dagoretti South",
        wards: [
          { name: "Mutu-Ini" },
          { name: "Ngando" },
          { name: "Riruta" },
          { name: "Uthiru/Ruthimitu" },
          { name: "Waithaka" }
        ]
      },
      {
        name: "Lang'ata",
        wards: [
          { name: "Karen" },
          { name: "Nairobi West" },
          { name: "Mugumu-Ini" },
          { name: "South C" },
          { name: "Nyayo Highrise" }
        ]
      },
      {
        name: "Kibra",
        wards: [
          { name: "Woodley/Kenyatta Golf Course" },
          { name: "Sarang'ombe" },
          { name: "Makina" },
          { name: "Lindi" },
          { name: "Laini Saba" }
        ]
      },
      {
        name: "Roysambu",
        wards: [
          { name: "Kahawa West" },
          { name: "Roysambu" },
          { name: "Githurai" },
          { name: "Kahawa" },
          { name: "Zimmerman" }
        ]
      },
      {
        name: "Kasarani",
        wards: [
          { name: "Kasarani" },
          { name: "Njiru" },
          { name: "Clay City" },
          { name: "Mwiki" },
          { name: "Ruai" }
        ]
      },
      {
        name: "Ruaraka",
        wards: [
          { name: "Utalii" },
          { name: "Korogocho" },
          { name: "Lucky Summer" },
          { name: "Mathare North" },
          { name: "Baba Dogo" }
        ]
      },
      {
        name: "Embakasi South",
        wards: [
          { name: "Kwa Njenga" },
          { name: "Imara Daima" },
          { name: "Kware" },
          { name: "Kwa Reuben" },
          { name: "Pipeline" }
        ]
      },
      {
        name: "Embakasi North",
        wards: [
          { name: "Dandora Area I" },
          { name: "Dandora Area II" },
          { name: "Dandora Area III" },
          { name: "Dandora Area IV" },
          { name: "Kariobangi North" }
        ]
      },
      {
        name: "Embakasi Central",
        wards: [
          { name: "Kayole North" },
          { name: "Kayole Central" },
          { name: "Kariobangi South" },
          { name: "Komarock" },
          { name: "Matopeni / Spring Valley" }
        ]
      },
      {
        name: "Embakasi East",
        wards: [
          { name: "Utawala" },
          { name: "Upper Savanna" },
          { name: "Lower Savanna" },
          { name: "Embakasi" },
          { name: "Mihango" }
        ]
      },
      {
        name: "Embakasi West",
        wards: [
          { name: "Umoja 1" },
          { name: "Umoja 2" },
          { name: "Mowlem" },
          { name: "Kariobangi South" },
          { name: "Maringo/ Hamza" }
        ]
      },
      {
        name: "Makadara",
        wards: [
          { name: "Viwandani" },
          { name: "Harambee" },
          { name: "Makongeni" },
          { name: "Pumwani" },
          { name: "Eastleigh North" }
        ]
      },
      {
        name: "Kamukunji",
        wards: [
          { name: "Eastleigh South" },
          { name: "Nairobi Central" },
          { name: "Airbase" },
          { name: "California" },
          { name: "Mgara" }
        ]
      },
      {
        name: "Starehe",
        wards: [
          { name: "Nairobi South" },
          { name: "Hospital" },
          { name: "Ngara" },
          { name: "Pangani" },
          { name: "Landimawe" },
          { name: "Ziwani / Kariokor" }
        ]
      },
      {
        name: "Mathare",
        wards: [
          { name: "Mlango Kubwa" },
          { name: "Kiamaiko" },
          { name: "Ngei" },
          { name: "Huruma" },
          { name: "Mabatini" }
        ]
      }
    ]
  },
  {
    name: "Kiambu County",
    hasWards: true,
    constituencies: [
      {
        name: "Gatundu North",
        wards: [
          { name: "Gituamba" },
          { name: "Githobokoni" },
          { name: "Chania" },
          { name: "Mang'u" }
        ]
      },
      {
        name: "Gatundu South",
        wards: [
          { name: "Kiamwangi" },
          { name: "Kiganjo" },
          { name: "Ndarugu" },
          { name: "Ngenda" }
        ]
      },
      {
        name: "Githunguri",
        wards: [
          { name: "Githunguri" },
          { name: "Githiga" },
          { name: "Ikinu" },
          { name: "Ngewa" },
          { name: "Komothai" }
        ]
      },
      {
        name: "Juja",
        wards: [
          { name: "Murera" },
          { name: "Theta" },
          { name: "Juja" },
          { name: "Witeithie" },
          { name: "Kalimoni" }
        ]
      },
      {
        name: "Kabete",
        wards: [
          { name: "Gitaru" },
          { name: "Muguga" },
          { name: "Nyathuna" },
          { name: "Kabete" },
          { name: "Uthiru" }
        ]
      },
      {
        name: "Kiambaa",
        wards: [
          { name: "Cianda" },
          { name: "Karuiri" },
          { name: "Ndenderu" },
          { name: "Muchatha" },
          { name: "Kihara" }
        ]
      },
      {
        name: "Kiambu",
        wards: [
          { name: "Ting'gang'a" },
          { name: "Ndumberi" },
          { name: "Riabai" },
          { name: "Township" }
        ]
      },
      {
        name: "Limuru",
        wards: [
          { name: "Bibirioni" },
          { name: "Limuru Central" },
          { name: "Ndeiya" },
          { name: "Limuru East" },
          { name: "Ngecha Tigoni" }
        ]
      },
      {
        name: "Kikuyu",
        wards: [
          { name: "Karai" },
          { name: "Nachu" },
          { name: "Sigona" },
          { name: "Kikuyu" },
          { name: "Kinoo" }
        ]
      },
      {
        name: "Lari",
        wards: [
          { name: "Kijabe" },
          { name: "Nyanduma" },
          { name: "Kamburu" },
          { name: "Lari/Kirenga" }
        ]
      },
      {
        name: "Ruiru",
        wards: [
          { name: "Gitothua" },
          { name: "Biashara" },
          { name: "Gatongora" },
          { name: "Kahawa Sukari" },
          { name: "Kahawa Wendani" },
          { name: "Kiuu" },
          { name: "Mwiki" },
          { name: "Mwihoko" }
        ]
      },
      {
        name: "Thika Town",
        wards: [
          { name: "Township" },
          { name: "Kamenu" },
          { name: "Hospital" },
          { name: "Gatuanyaga" },
          { name: "Ngoliba" }
        ]
      }
    ]
  },
  {
    name: "Kajiado County",
    hasWards: true,
    constituencies: [
      {
        name: "Kajiado Central",
        wards: [
          { name: "Purko" },
          { name: "Ildamat" },
          { name: "Dalalekutuk" },
          { name: "Matapato North" },
          { name: "Matapato South" }
        ]
      },
      {
        name: "Kajiado East",
        wards: [
          { name: "Kaputiei North" },
          { name: "Kitengela" },
          { name: "Oloosirkon/Sholinke" },
          { name: "Kenyawa-Poka" },
          { name: "Imaroro" }
        ]
      },
      {
        name: "Kajiado North",
        wards: [
          { name: "Olkeri" },
          { name: "Ongata Rongai" },
          { name: "Nkaimurunya" },
          { name: "Oloolua" },
          { name: "Ngong" }
        ]
      },
      {
        name: "Kajiado West",
        wards: [
          { name: "Keekonyokie" },
          { name: "Iloodokilani" },
          { name: "Magadi" },
          { name: "Ewuaso Oonkidong'i" },
          { name: "Mosiro" }
        ]
      },
      {
        name: "Kajiado South",
        wards: [
          { name: "Entonet/Lenkisi" },
          { name: "Mbirikani/Eselen" },
          { name: "Keikuku" },
          { name: "Rombo" },
          { name: "Kimana" }
        ]
      }
    ]
  },
  {
    name: "Machakos County",
    hasWards: true,
    constituencies: [
      {
        name: "Masinga",
        wards: [
          { name: "Kivaa" },
          { name: "Masinga" },
          { name: "Central" },
          { name: "Ekalakala" },
          { name: "Muthesya" },
          { name: "Ndithini" }
        ]
      },
      {
        name: "Yatta",
        wards: [
          { name: "Ndalani" },
          { name: "Matuu" },
          { name: "Kithimani" },
          { name: "Ikomba" },
          { name: "Katangi" }
        ]
      },
      {
        name: "Matungulu",
        wards: [
          { name: "Tala" },
          { name: "Matungulu North" },
          { name: "Matungulu East" },
          { name: "Matungulu West" },
          { name: "Kyeleni" }
        ]
      },
      {
        name: "Kangundo",
        wards: [
          { name: "Kangundo North" },
          { name: "Kangundo Central" },
          { name: "Kangundo East" },
          { name: "Kangundo West" }
        ]
      },
      {
        name: "Mwala",
        wards: [
          { name: "Mbiuni" },
          { name: "Makutano/Mwala" },
          { name: "Masii" },
          { name: "Muthetheni" },
          { name: "Wamunyu" },
          { name: "Kibauni" }
        ]
      },
      {
        name: "Kathiani",
        wards: [
          { name: "Mitaboni" },
          { name: "Kathiani Central" },
          { name: "Upper Kaewa/Iveti" },
          { name: "Lower Kaewa/Kaani" }
        ]
      },
      {
        name: "Machakos Town",
        wards: [
          { name: "Kalama" },
          { name: "Mua" },
          { name: "Mutitini" },
          { name: "Machakos Central" },
          { name: "Mumbuni North" },
          { name: "Muvuti/Kiima-Kimwe" },
          { name: "Kola" }
        ]
      },
      {
        name: "Mavoko",
        wards: [
          { name: "Athi River" },
          { name: "Kinanie" },
          { name: "Muthwani" },
          { name: "Syokimau/Mulolongo" }
        ]
      }
    ]
  },
  // Counties without wards (only constituencies)
  {
    name: "Nakuru County",
    hasWards: false,
    constituencies: [
      { name: "Nakuru Town East", wards: [] },
      { name: "Nakuru Town West", wards: [] },
      { name: "Bahati", wards: [] },
      { name: "Subukia", wards: [] },
      { name: "Rongai", wards: [] },
      { name: "Kuresoi North", wards: [] },
      { name: "Kuresoi South", wards: [] },
      { name: "Molo", wards: [] },
      { name: "Njoro", wards: [] },
      { name: "Gilgil", wards: [] },
      { name: "Naivasha", wards: [] }
    ]
  },
  {
    name: "Kakamega County",
    hasWards: false,
    constituencies: [
      { name: "Lugari", wards: [] },
      { name: "Likuyani", wards: [] },
      { name: "Malava", wards: [] },
      { name: "Lurambi", wards: [] },
      { name: "Navakholo", wards: [] },
      { name: "Mumias East", wards: [] },
      { name: "Mumias West", wards: [] },
      { name: "Butere", wards: [] },
      { name: "Khwisero", wards: [] },
      { name: "Matungu", wards: [] },
      { name: "Ikolomani", wards: [] },
      { name: "Shinyalu", wards: [] }
    ]
  },
  {
    name: "Bungoma County",
    hasWards: false,
    constituencies: [
      { name: "Mount Elgon", wards: [] },
      { name: "Sirisia", wards: [] },
      { name: "Kabuchai", wards: [] },
      { name: "Webuye West", wards: [] },
      { name: "Webuye East", wards: [] },
      { name: "Bungoma", wards: [] },
      { name: "Kanduyi", wards: [] },
      { name: "Bumula", wards: [] },
      { name: "Butula", wards: [] }
    ]
  },
  {
    name: "Meru County",
    hasWards: false,
    constituencies: [
      { name: "Igembe South", wards: [] },
      { name: "Igembe Central", wards: [] },
      { name: "Igembe North", wards: [] },
      { name: "Tigania West", wards: [] },
      { name: "Tigania East", wards: [] },
      { name: "North Imenti", wards: [] },
      { name: "Buuri", wards: [] },
      { name: "Central Imenti", wards: [] },
      { name: "South Imenti", wards: [] }
    ]
  },
  {
    name: "Kilifi County",
    hasWards: false,
    constituencies: [
      { name: "Kilifi North", wards: [] },
      { name: "Kilifi South", wards: [] },
      { name: "Kaloleni", wards: [] },
      { name: "Rabai", wards: [] },
      { name: "Ganze", wards: [] },
      { name: "Malindi", wards: [] },
      { name: "Magarini", wards: [] }
    ]
  },
  {
    name: "Kisii County",
    hasWards: false,
    constituencies: [
      { name: "Bonchari", wards: [] },
      { name: "South Mugirango", wards: [] },
      { name: "Bomachoge Borabu", wards: [] },
      { name: "Bomachoge Chache", wards: [] },
      { name: "Bobasi", wards: [] },
      { name: "Nyaribari Masaba", wards: [] },
      { name: "Nyaribari Chache", wards: [] },
      { name: "Kitutu Chache North", wards: [] },
      { name: "Kitutu Chache South", wards: [] }
    ]
  },
  {
    name: "Mombasa County",
    hasWards: false,
    constituencies: [
      { name: "Changamwe", wards: [] },
      { name: "Jomvu", wards: [] },
      { name: "Kisauni", wards: [] },
      { name: "Nyali", wards: [] },
      { name: "Likoni", wards: [] },
      { name: "Mvita", wards: [] }
    ]
  },
  {
    name: "Narok County",
    hasWards: false,
    constituencies: [
      { name: "Kilgoris", wards: [] },
      { name: "Emurua Dikirr", wards: [] },
      { name: "Loita", wards: [] },
      { name: "Narok North", wards: [] },
      { name: "Narok East", wards: [] },
      { name: "Narok South", wards: [] },
      { name: "Narok West", wards: [] }
    ]
  },
  {
    name: "Uasin Gishu County",
    hasWards: false,
    constituencies: [
      { name: "Ainabkoi", wards: [] },
      { name: "Kapseret", wards: [] },
      { name: "Kesses", wards: [] },
      { name: "Moiben", wards: [] },
      { name: "Soy", wards: [] },
      { name: "Turbo", wards: [] }
    ]
  },
  {
    name: "Kisumu County",
    hasWards: false,
    constituencies: [
      { name: "Kisumu West", wards: [] },
      { name: "Kisumu East", wards: [] },
      { name: "Kisumu Central", wards: [] },
      { name: "Seme", wards: [] },
      { name: "Nyando", wards: [] },
      { name: "Muhoroni", wards: [] },
      { name: "Nyakach", wards: [] }
    ]
  },
  {
    name: "Migori County",
    hasWards: false,
    constituencies: [
      { name: "Rongo", wards: [] },
      { name: "Awendo", wards: [] },
      { name: "Suna East", wards: [] },
      { name: "Suna West", wards: [] },
      { name: "Uriri", wards: [] },
      { name: "Nyatike", wards: [] },
      { name: "Kuria West", wards: [] },
      { name: "Kuria East", wards: [] }
    ]
  },
  {
    name: "Homa Bay County",
    hasWards: false,
    constituencies: [
      { name: "Kasipul", wards: [] },
      { name: "Kabondo Kasipul", wards: [] },
      { name: "Karachuonyo", wards: [] },
      { name: "Rachuonyo North", wards: [] },
      { name: "Rachuonyo East", wards: [] },
      { name: "Homa Bay Town", wards: [] },
      { name: "Rangwe", wards: [] },
      { name: "Suba North", wards: [] },
      { name: "Suba South", wards: [] }
    ]
  },
  {
    name: "Kitui County",
    hasWards: false,
    constituencies: [
      { name: "Mwingi North", wards: [] },
      { name: "Mwingi West", wards: [] },
      { name: "Mwingi Central", wards: [] },
      { name: "Kitui West", wards: [] },
      { name: "Kitui Rural", wards: [] },
      { name: "Kitui Central", wards: [] },
      { name: "Kitui East", wards: [] },
      { name: "Kitui South", wards: [] }
    ]
  },
  {
    name: "Murang'a County",
    hasWards: false,
    constituencies: [
      { name: "Kangema", wards: [] },
      { name: "Mathioya", wards: [] },
      { name: "Kiharu", wards: [] },
      { name: "Kigumo", wards: [] },
      { name: "Maragwa", wards: [] },
      { name: "Kandara", wards: [] },
      { name: "Gatanga", wards: [] }
    ]
  },
  {
    name: "Trans-Nzoia County",
    hasWards: false,
    constituencies: [
      { name: "Cherangany", wards: [] },
      { name: "Endebess", wards: [] },
      { name: "Kwanza", wards: [] },
      { name: "Saboti", wards: [] },
      { name: "Kiminini", wards: [] }
    ]
  },
  {
    name: "Siaya County",
    hasWards: false,
    constituencies: [
      { name: "Ugenya", wards: [] },
      { name: "Ugunja", wards: [] },
      { name: "Alego Usonga", wards: [] },
      { name: "Gem", wards: [] },
      { name: "Bondo", wards: [] },
      { name: "Rarieda", wards: [] }
    ]
  },
  {
    name: "Makueni County",
    hasWards: false,
    constituencies: [
      { name: "Mbooni", wards: [] },
      { name: "Kilome", wards: [] },
      { name: "Kaiti", wards: [] },
      { name: "Makueni", wards: [] },
      { name: "Kibwezi West", wards: [] },
      { name: "Kibwezi East", wards: [] }
    ]
  },
  {
    name: "Turkana County",
    hasWards: false,
    constituencies: [
      { name: "Turkana North", wards: [] },
      { name: "Turkana West", wards: [] },
      { name: "Turkana Central", wards: [] },
      { name: "Loima", wards: [] },
      { name: "Turkana South", wards: [] },
      { name: "Turkana East", wards: [] }
    ]
  },
  {
    name: "Busia County",
    hasWards: false,
    constituencies: [
      { name: "Nambale", wards: [] },
      { name: "Butula", wards: [] },
      { name: "Funyula", wards: [] },
      { name: "Samia", wards: [] },
      { name: "Bunyala", wards: [] },
      { name: "Budalang'i", wards: [] },
      { name: "Teso North", wards: [] },
      { name: "Teso South", wards: [] }
    ]
  },
  {
    name: "Mandera County",
    hasWards: false,
    constituencies: [
      { name: "Mandera West", wards: [] },
      { name: "Banissa", wards: [] },
      { name: "Mandera North", wards: [] },
      { name: "Mandera South", wards: [] },
      { name: "Mandera East", wards: [] },
      { name: "Lafey", wards: [] }
    ]
  },
  {
    name: "Kericho County",
    hasWards: false,
    constituencies: [
      { name: "Kipkelion East", wards: [] },
      { name: "Kipkelion West", wards: [] },
      { name: "Ainamoi", wards: [] },
      { name: "Bureti", wards: [] },
      { name: "Belgut", wards: [] },
      { name: "Sigowet/Soin", wards: [] }
    ]
  },
  {
    name: "Nandi County",
    hasWards: false,
    constituencies: [
      { name: "Aldai", wards: [] },
      { name: "Chesumei", wards: [] },
      { name: "Emgwen", wards: [] },
      { name: "Mosop", wards: [] },
      { name: "Nandi Hills", wards: [] },
      { name: "Tinderet", wards: [] }
    ]
  },
  {
    name: "Kwale County",
    hasWards: false,
    constituencies: [
      { name: "Msambweni", wards: [] },
      { name: "Lunga Lunga", wards: [] },
      { name: "Matuga", wards: [] },
      { name: "Kinango", wards: [] }
    ]
  },
  {
    name: "Bomet County",
    hasWards: false,
    constituencies: [
      { name: "Sotik", wards: [] },
      { name: "Chepalungu", wards: [] },
      { name: "Bomet Central", wards: [] },
      { name: "Bomet East", wards: [] },
      { name: "Konoin", wards: [] }
    ]
  },
  {
    name: "Garissa County",
    hasWards: false,
    constituencies: [
      { name: "Garissa Township", wards: [] },
      { name: "Balambala", wards: [] },
      { name: "Lagdera", wards: [] },
      { name: "Dadaab", wards: [] },
      { name: "Fafi", wards: [] },
      { name: "Ijara", wards: [] }
    ]
  },
  {
    name: "Wajir County",
    hasWards: false,
    constituencies: [
      { name: "Wajir North", wards: [] },
      { name: "Wajir East", wards: [] },
      { name: "Tarbaj", wards: [] },
      { name: "Wajir West", wards: [] },
      { name: "Eldas", wards: [] },
      { name: "Wajir South", wards: [] }
    ]
  },
  {
    name: "Nyeri County",
    hasWards: false,
    constituencies: [
      { name: "Tetu", wards: [] },
      { name: "Kieni", wards: [] },
      { name: "Mathira", wards: [] },
      { name: "Othaya", wards: [] },
      { name: "Mukurweini", wards: [] },
      { name: "Nyeri Town", wards: [] }
    ]
  },
  {
    name: "Baringo County",
    hasWards: false,
    constituencies: [
      { name: "Mogotio", wards: [] },
      { name: "Eldama Ravine", wards: [] },
      { name: "Baringo Central", wards: [] },
      { name: "Baringo North", wards: [] },
      { name: "Baringo South", wards: [] },
      { name: "Tiaty", wards: [] }
    ]
  },
  {
    name: "Nyandarua County",
    hasWards: false,
    constituencies: [
      { name: "Kinangop", wards: [] },
      { name: "Kipipiri", wards: [] },
      { name: "Ol Kalou", wards: [] },
      { name: "Ol Jorok", wards: [] },
      { name: "Ndaragwa", wards: [] }
    ]
  },
  {
    name: "West Pokot County",
    hasWards: false,
    constituencies: [
      { name: "Kapenguria", wards: [] },
      { name: "Sigor", wards: [] },
      { name: "Kacheliba", wards: [] },
      { name: "Pokot South", wards: [] }
    ]
  },
  {
    name: "Nyamira County",
    hasWards: false,
    constituencies: [
      { name: "Kitutu Masaba", wards: [] },
      { name: "North Mugirango", wards: [] },
      { name: "West Mugirango", wards: [] },
      { name: "Borabu", wards: [] }
    ]
  },
  {
    name: "Kirinyaga County",
    hasWards: false,
    constituencies: [
      { name: "Mwea", wards: [] },
      { name: "Gichugu", wards: [] },
      { name: "Ndia", wards: [] },
      { name: "Kirinyaga Central", wards: [] }
    ]
  },
  {
    name: "Embu County",
    hasWards: false,
    constituencies: [
      { name: "Manyatta", wards: [] },
      { name: "Runyenjes", wards: [] },
      { name: "Mbeere South", wards: [] },
      { name: "Mbeere North", wards: [] }
    ]
  },
  {
    name: "Vihiga County",
    hasWards: false,
    constituencies: [
      { name: "Vihiga", wards: [] },
      { name: "Emuhaya", wards: [] },
      { name: "Luanda", wards: [] },
      { name: "Hamisi", wards: [] },
      { name: "Sabatia", wards: [] }
    ]
  },
  {
    name: "Laikipia County",
    hasWards: false,
    constituencies: [
      { name: "Laikipia West", wards: [] },
      { name: "Laikipia East", wards: [] },
      { name: "Laikipia North", wards: [] }
    ]
  },
  {
    name: "Marsabit County",
    hasWards: false,
    constituencies: [
      { name: "Moyale", wards: [] },
      { name: "North Horr", wards: [] },
      { name: "Saku", wards: [] },
      { name: "Laisamis", wards: [] }
    ]
  },
  {
    name: "Elgeyo-Marakwet County",
    hasWards: false,
    constituencies: [
      { name: "Keiyo North", wards: [] },
      { name: "Keiyo South", wards: [] },
      { name: "Marakwet East", wards: [] },
      { name: "Marakwet West", wards: [] }
    ]
  },
  {
    name: "Tharaka-Nithi County",
    hasWards: false,
    constituencies: [
      { name: "Maara", wards: [] },
      { name: "Chuka/Igambang'ombe", wards: [] },
      { name: "Tharaka", wards: [] }
    ]
  },
  {
    name: "Taita–Taveta County",
    hasWards: false,
    constituencies: [
      { name: "Taveta", wards: [] },
      { name: "Wundanyi", wards: [] },
      { name: "Mwatate", wards: [] },
      { name: "Voi", wards: [] }
    ]
  },
  {
    name: "Tana River County",
    hasWards: false,
    constituencies: [
      { name: "Garsen", wards: [] },
      { name: "Galole", wards: [] },
      { name: "Bura", wards: [] }
    ]
  },
  {
    name: "Samburu County",
    hasWards: false,
    constituencies: [
      { name: "Samburu West", wards: [] },
      { name: "Samburu North", wards: [] },
      { name: "Samburu East", wards: [] }
    ]
  },
  {
    name: "Isiolo County",
    hasWards: false,
    constituencies: [
      { name: "Isiolo North", wards: [] },
      { name: "Isiolo South", wards: [] }
    ]
  },
  {
    name: "Lamu County",
    hasWards: false,
    constituencies: [
      { name: "Lamu East", wards: [] },
      { name: "Lamu West", wards: [] }
    ]
  }
];

// Helper functions
export const getCounties = () => locationData.map(county => county.name);

export const getConstituenciesByCounty = (countyName: string): string[] => {
  const county = locationData.find(c => c.name === countyName);
  return county ? county.constituencies.map(c => c.name) : [];
};

export const getWardsByConstituency = (countyName: string, constituencyName: string): string[] => {
  const county = locationData.find(c => c.name === countyName);
  if (!county) return [];
  
  const constituency = county.constituencies.find(c => c.name === constituencyName);
  return constituency ? constituency.wards.map(w => w.name) : [];
};

export const hasWards = (countyName: string): boolean => {
  const county = locationData.find(c => c.name === countyName);
  return county ? county.hasWards : false;
};
