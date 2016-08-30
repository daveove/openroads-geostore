var provinces = [
    'Abra',
    'Agusan del Norte',
    'Agusan del Sur',
    'Aklan',
    'Albay',
    'Antique',
    'Apayao',
    'Aurora',
    'Basilan',
    'Bataan',
    'Batanes',
    'Batangas',
    'Benguet',
    'Biliran',
    'Bohol',
    'Bukidnon',
    'Bulacan',
    'Cagayan',
    'Camarines Norte',
    'Camarines Sur',
    'Camiguin',
    'Capiz',
    'Catanduanes',
    'Cavite',
    'Cebu',
    'Compostela Valley',
    'Cotabato',
    'Davao del Norte',
    'Davao del Sur',
    'Davao Oriental',
    'Dinagat Islands',
    'Eastern Samar',
    'Guimaras',
    'Ifugao',
    'Ilocos Norte',
    'Ilocos Sur',
    'Iloilo',
    'Isabela',
    'Kalinga',
    'La Union',
    'Laguna',
    'Lanao del Norte',
    'Lanao del Sur',
    'Leyte',
    'Maguindanao',
    'Marinduque',
    'Masbate',
    'Metro Manila',
    'Misamis Occidental',
    'Misamis Oriental',
    'Mountain Province',
    'Negros Occidental',
    'Negros Oriental',
    'Northern Samar',
    'Nueva Ecija',
    'Nueva Vizcaya',
    'Occidental Mindoro',
    'Oriental Mindoro',
    'Palawan',
    'Pampanga',
    'Pangasinan',
    'Quezon',
    'Quirino',
    'Rizal',
    'Romblon',
    'Samar',
    'Sarangani',
    'Siquijor',
    'Sorsogon',
    'South Cotabato',
    'Southern Leyte',
    'Sultan Kudarat',
    'Sulu',
    'Surigao del Norte',
    'Surigao del Sur',
    'Tarlac',
    'Tawi-Tawi',
    'Zambales',
    'Zamboanga del Norte',
    'Zamboanga del Sur',
    'Zamboanga Sibugay'
];
var municipalities = {
    "abra": [
        "Bangued",
        "Boliney",
        "Bucay",
        "Bucloc",
        "Daguioman",
        "Danglas",
        "Dolores",
        "La Paz",
        "Lacub",
        "Lagangilang",
        "Lagayan",
        "Langiden",
        "Licuan-Baay",
        "Luba",
        "Malibcong",
        "Manabo",
        "Peñarrubia",
        "Pidigan",
        "Pilar",
        "Sallapadan",
        "San Isidro",
        "San Juan",
        "San Quintin",
        "Tayum",
        "Tineg",
        "Tubo",
        "Villaviciosa"
    ],
    "agusan_del_norte": [
        "Buenavista",
        "Butuan City",
        "Cabadbaran City",
        "Carmen",
        "Jabonga",
        "Kitcharao",
        "Las Nieves",
        "Magallanes",
        "Nasipit",
        "Remedios T. Romualdez",
        "Santiago",
        "Tubay"
    ],
    "agusan_del_sur": [
        "Bayugan City",
        "Bunawan",
        "Esperanza",
        "La Paz",
        "Loreto",
        "Prosperidad",
        "Rosario",
        "San Francisco",
        "San Luis",
        "Santa Josefa",
        "Sibagat",
        "Talacogon",
        "Trento",
        "Veruela"
    ],
    "aklan": [
        "Altavas",
        "Balete",
        "Banga",
        "Batan",
        "Buruanga",
        "Ibajay",
        "Kalibo",
        "Lezo",
        "Libacao",
        "Madalag",
        "Makato",
        "Malay",
        "Malinao",
        "Nabas",
        "New Washington",
        "Numancia",
        "Tangalan"
    ],
    "albay": [
        "Bacacay",
        "Camalig",
        "Daraga",
        "Guinobatan",
        "Jovellar",
        "Legazpi City",
        "Libon",
        "Ligao City",
        "Malilipot",
        "Malinao",
        "Manito",
        "Oas",
        "Pio Duran",
        "Polangui",
        "Rapu-Rapu",
        "Santo Domingo",
        "Tabaco City",
        "Tiwi"
    ],
    "antique": [
        "Anini-y",
        "Barbaza",
        "Belison",
        "Bugasong",
        "Caluya",
        "Culasi",
        "Hamtic",
        "Laua-an",
        "Libertad",
        "Pandan",
        "Patnongon",
        "San Jose",
        "San Remigio",
        "Sebaste",
        "Sibalom",
        "Tibiao",
        "Tobias Fornier",
        "Valderrama"
    ],
    "apayao": [
        "Calanasan",
        "Conner",
        "Flora",
        "Kabugao",
        "Luna",
        "Pudtol",
        "Santa Marcela"
    ],
        "aurora": [
        "Baler",
        "Casiguran",
        "Dilasag",
        "Dinalungan",
        "Dingalan",
        "Dipaculao",
        "Maria Aurora",
        "San Luis"
    ],
    "basilan": [
        "Akbar",
        "Al-Barka",
        "Hadji Mohammad Ajul",
        "Hadji Muhtamad",
        "Isabela City",
        "Lamitan City",
        "Lantawan",
        "Maluso",
        "Sumisip",
        "Tabuan-Lasa",
        "Tipo-Tipo",
        "Tuburan",
        "Ungkaya Pukan"
    ],
    "bataan": [
        "Abucay",
        "Balanga City",
        "Bagac",
        "Dinalupihan",
        "Hermosa",
        "Limay",
        "Mariveles",
        "Morong",
        "Orani",
        "Orion",
        "Pilar",
        "Samal"
    ],
    "batanes": [
        "Basco",
        "Itbayat",
        "Ivana",
        "Mahatao",
        "Sabtang",
        "Uyugan"
    ],
    "batangas": [
        "Agoncillo",
        "Alitagtag",
        "Balayan",
        "Balete",
        "Batangas City",
        "Bauan",
        "Calaca",
        "Calatagan",
        "Cuenca",
        "Ibaan",
        "Laurel",
        "Lemery",
        "Lian",
        "Lipa City",
        "Lobo",
        "Mabini",
        "Malvar",
        "Mataas na Kahoy",
        "Nasugbu",
        "Padre Garcia",
        "Rosario",
        "San Jose",
        "San Juan",
        "San Luis",
        "San Nicolas",
        "San Pascual",
        "Santa Teresita",
        "Santo Tomas",
        "Taal",
        "Talisay",
        "Tanauan City",
        "Taysan",
        "Tingloy",
        "Tuy"
    ],
    "benguet": [
        "Atok",
        "Baguio City",
        "Bakun",
        "Bokod",
        "Buguias",
        "Itogon",
        "Kabayan",
        "Kapangan",
        "Kibungan",
        "La Trinidad",
        "Mankayan",
        "Sablan",
        "Tuba",
        "Tublay"
    ],
    "biliran": [
        "Almeria",
        "Biliran",
        "Cabucgayan",
        "Caibiran",
        "Culaba",
        "Kawayan",
        "Maripipi",
        "Naval"
    ],
    "bohol": [
        "Alburquerque",
        "Alicia",
        "Anda",
        "Antequera",
        "Baclayon",
        "Balilihan",
        "Batuan",
        "Bien Unido",
        "Bilar",
        "Buenavista",
        "Calape",
        "Candijay",
        "Carmen",
        "Catigbian",
        "Clarin",
        "Corella",
        "Cortes",
        "Dagohoy",
        "Danao",
        "Dauis",
        "Dimiao",
        "Duero",
        "Garcia Hernandez",
        "Guindulman",
        "Inabanga",
        "Jagna",
        "Jetafe",
        "Lila",
        "Loay",
        "Loboc",
        "Loon",
        "Mabini",
        "Maribojoc",
        "Panglao",
        "Pilar",
        "Pres. Carlos P. Garcia",
        "Sagbayan",
        "San Isidro",
        "San Miguel",
        "Sevilla",
        "Sierra Bullones",
        "Sikatuna",
        "Tagbilaran City",
        "Talibon",
        "Trinidad",
        "Tubigon",
        "Ubay",
        "Valencia"
    ],
    "bukidnon": [
        "Baungon",
        "Cabanglasan",
        "Dangcagan",
        "Don Carlos",
        "Impasug-Ong",
        "Kadingilan",
        "Kalilangan",
        "Kibawe",
        "Kitaotao",
        "Lantapan",
        "Libona",
        "Malitbog",
        "Manolo Fortich",
        "Malaybalay City","Maramag",
        "Pangantucan",
        "Quezon",
        "San Fernando",
        "Sumilao",
        "Talakag",
        "Valencia City"
    ],
    "bulacan": [
    "Angat",
    "Balagtas",
    "Baliuag",
    "Bocaue","Bulacan",
    "Bustos","Calumpit",
    "Doña Remedios Trinidad",
    "Guiguinto",
    "Hagonoy",
    "Malolos City","Marilao",
    "Meycauayan City","Norzagaray",
    "Obando",
    "Pandi",
    "Paombong",
    "Plaridel",
    "Pulilan",
    "San Ildefonso",
    "San Jose del Monte City",
    "San Miguel",
    "San Rafael",
    "Santa Maria"
    ],
    "cagayan": [
    "Abulug",
    "Alcala",
    "Allacapan",
    "Amulung",
    "Aparri",
    "Baggao",
    "Ballesteros",
    "Buguey",
    "Calayan",
    "Camalaniugan",
    "Claveria",
    "Enrile",
    "Gattaran",
    "Gonzaga",
    "Iguig",
    "Lal-lo",
    "Lasam",
    "Pamplona",
    "Peñablanca",
    "Piat",
    "Rizal",
    "Sanchez-Mira",
    "Santa Ana",
    "Santa Praxedes",
    "Santa Teresita",
    "Santo Niño",
    "Solana",
    "Tuao",
    "Tuguegarao City"
    ],
    "camarines_norte": [
    "Basud",
    "Capalonga",
    "Daet",
    "Jose Panganiban",
    "Labo",
    "Mercedes",
    "Paracale",
    "San Lorenzo Ruiz",
    "San Vicente",
    "Santa Elena",
    "Talisay",
    "Vinzons"
    ],
    "camarines_sur": [
    "Baao",
    "Balatan",
    "Bato",
    "Bombon",
    "Buhi",
    "Bula",
    "Cabusao",
    "Calabanga",
    "Camaligan",
    "Canaman",
    "Caramoan",
    "Del Gallego",
    "Gainza",
    "Garchitorena",
    "Goa",
    "Iriga City","Lagonoy",
    "Libmanan",
    "Lupi",
    "Magarao",
    "Milaor",
    "Minalabac",
    "Nabua",
    "Naga City",
    "Ocampo",
    "Pamplona",
    "Pasacao",
    "Pili",
    "Presentacion",
    "Ragay",
    "Sagñay",
    "San Fernando",
    "San Jose",
    "Sipocot",
    "Siruma",
    "Tigaon",
    "Tinambac"
    ],
    "camiguin": [
    "Catarman",
    "Guinsiliban",
    "Mahinog",
    "Mambajao",
    "Sagay"
    ],
    "capiz": [
    "Cuartero",
    "Dao",
    "Dumalag",
    "Dumarao",
    "Ivisan",
    "Jamindan",
    "Ma-ayon",
    "Mambusao",
    "Panay",
    "Panitan",
    "Pilar",
    "Pontevedra",
    "President Roxas",
    "Sapi-an",
    "Roxas City",
    "Sigma",
    "Tapaz"
    ],
    "catanduanes": [
    "Bagamanoc",
    "Baras",
    "Bato",
    "Caramoran",
    "Gigmoto",
    "Pandan",
    "Panganiban",
    "San Andres",
    "San Miguel",
    "Viga",
    "Virac"
    ],
    "cavite": [
    "Alfonso",
    "Amadeo",
    "Bacoor City",
    "Carmona",
    "Cavite City",
    "Dasmariñas City",
    "General Mariano Alvarez",
    "General Emilio Aguinaldo",
    "General Trias",
    "Imus City",
    "Indang",
    "Kawit",
    "Magallanes",
    "Maragondon",
    "Mendez",
    "Naic",
    "Noveleta",
    "Rosario",
    "Silang",
    "Tagaytay City",
    "Tanza",
    "Ternate",
    "Trece Martires City"
    ],
    "cebu": [
    "Alcantara",
    "Alcoy",
    "Alegria",
    "Aloguinsan",
    "Argao",
    "Asturias",
    "Badian",
    "Balamban",
    "Bantayan",
    "Barili",
    "Bogo City",
    "Boljoon",
    "Borbon",
    "Carcar City" ,"Carmen",
    "Catmon",
    "Cebu City",
    "Compostela",
    "Consolacion",
    "Cordoba",
    "Daanbantayan",
    "Dalaguete",
    "Danao City",
    "DumanjugGinatilan",
    "Lapu-Lapu City",
    "Liloan",
    "Madridejos",
    "Malabuyoc",
    "Mandaue City",
    "Medellin",
    "Minglanilla",
    "Moalboal",
    "Naga City",
    "Oslob",
    "Pilar",
    "Pinamungahan",
    "Poro",
    "Ronda",
    "Samboan",
    "San Fernando",
    "San Francisco",
    "San Remigio",
    "Santa Fe",
    "Santander",
    "Sibonga",
    "Sogod",
    "Tabogon",
    "Tabuelan",
    "Talisay City",
    "Toledo City",
    "Tuburan",
    "Tudela"
    ],
    "compostela_valley": [
    "Compostela",
    "Laak",
    "Mabini",
    "Maco",
    "Maragusan",
    "Mawab",
    "Monkayo",
    "Montevista",
    "Nabunturan",
    "New Bataan",
    "Pantukan"
    ],
    "cotabato": [
    "Alamada",
    "Aleosan",
    "Antipas",
    "Arakan",
    "Banisilan",
    "Carmen",
    "Kabacan",
    "Kidapawan City",
    "Libungan",
    "M'lang",
    "Magpet",
    "Makilala",
    "Matalam",
    "Midsayap",
    "Pigkawayan",
    "Pikit",
    "President Roxas",
    "Tulunan"
    ],
    "davao_del_norte": [
    "Asuncion",
    "Braulio E. Dujali",
    "Carmen",
    "Kapalong",
    "New Corella",
    "Panabo City",
    "Samal City",
    "San Isidro",
    "Santo Tomas",
    "Tagum City",
    "Talaingod"
    ],
    "davao_del_sur": [
    "Bansalan",
    "Davao City",
    "Digos City",
    "Don Marcelino",
    "Hagonoy",
    "Jose Abad Santos",
    "Kiblawan",
    "Magsaysay",
    "Malalag",
    "Malita",
    "Matanao",
    "Padada",
    "Santa Cruz",
    "Santa Maria",
    "Sarangani",
    "Sulop"
    ],
    "davao_oriental": [
    "Baganga",
    "Banaybanay",
    "Boston",
    "Caraga",
    "Cateel",
    "Governor Generoso",
    "Lupon",
    "Manay",
    "Mati City",
    "San Isidro",
    "Tarragona"
    ],
    "dinagat_islands": [
    "Basilisa (Rizal)",
    "Cagdianao",
    "Dinagat",
    "Libjo (Albor)",
    "Loreto",
    "San Jose",
    "Tubajon"
    ],
    "eastern_samar": [
    "Arteche",
    "Balangiga",
    "Balangkayan",
    "Borongan City",
    "Can-avid",
    "Dolores",
    "General MacArthur",
    "Giporlos",
    "Guiuan",
    "Hernani",
    "Jipapad",
    "Lawaan",
    "Llorente",
    "Maslog",
    "Maydolong",
    "Mercedes",
    "Oras",
    "Quinapondan",
    "Salcedo",
    "San Julian",
    "San Policarpo",
    "Sulat",
    "Taft"
    ],
    "guimaras": [
    "Buenavista",
    "Jordan",
    "Nueva Valencia",
    "San Lorenzo",
    "Sibunag"
    ],
    "ifugao": [
    "Aguinaldo",
    "Alfonso Lista",
    "Asipulo",
    "Banaue",
    "Hingyon",
    "Hungduan",
    "Kiangan",
    "Lagawe",
    "Lamut",
    "Mayoyao",
    "Tinoc"
    ],
    "ilocos_norte": [
    "Adams",
    "Bacarra",
    "Badoc",
    "Bangui",
    "Banna",
    "Batac City",
    "Burgos",
    "Carasi",
    "Currimao",
    "Dingras",
    "Dumalneg",
    "Laoag City",
    "Marcos",
    "Nueva Era",
    "Pagudpud",
    "Paoay",
    "Pasuquin",
    "Piddig",
    "Pinili",
    "San Nicolas",
    "Sarrat",
    "Solsona",
    "Vintar"
    ],
    "ilocos_sur": [
    "Alilem",
    "Banayoyo",
    "Bantay",
    "Burgos",
    "Cabugao",
    "Candon City",
    "Caoayan",
    "Cervantes",
    "Galimuyod",
    "Gregorio Del Pilar",
    "Lidlidda",
    "Magsingal",
    "Nagbukel",
    "Narvacan",
    "Quirino",
    "Salcedo",
    "San Emilio",
    "San Esteban",
    "San Ildefonso",
    "San Juan",
    "San Vicente",
    "Santa",
    "Santa Catalina",
    "Santa Cruz",
    "Santa Lucia",
    "Santa Maria",
    "Santiago",
    "Santo Domingo",
    "Sigay",
    "Sinait",
    "Sugpon",
    "Suyo",
    "Tagudin",
    "Vigan City"
    ],
    "iloilo": [
    "Ajuy",
    "Alimodian",
    "Anilao",
    "Badiangan",
    "Balasan",
    "Banate",
    "Barotac Nuevo",
    "Barotac Viejo",
    "Batad",
    "Bingawan",
    "Cabatuan",
    "Calinog",
    "Carles",
    "Concepcion",
    "Dingle",
    "Dueñas",
    "Dumangas",
    "Estancia",
    "Guimbal",
    "Igbaras",
    "Iloilo City",
    "Janiuay",
    "Lambunao",
    "Leganes",
    "Lemery",
    "Leon",
    "Maasin",
    "Miagao",
    "Mina",
    "New Lucena",
    "Oton",
    "Pavia",
    "Passi City",
    "Pototan",
    "San Dionisio",
    "San Enrique",
    "San Joaquin",
    "San Miguel",
    "San Rafael",
    "Santa Barbara",
    "Sara",
    "Tigbauan",
    "Tubungan",
    "Zarraga"
    ],
    "isabela": [
    "Alicia",
    "Angadanan",
    "Aurora",
    "Benito Soliven",
    "Burgos",
    "Cabagan",
    "Cabatuan",
    "Cauayan City",
    "Cordon",
    "Delfin Albano",
    "Dinapigue",
    "Divilacan",
    "Echague",
    "Gamu",
    "Ilagan City",
    "Jones",
    "Luna",
    "Maconacon",
    "Mallig",
    "Naguilian",
    "Palanan",
    "Quezon",
    "Quirino",
    "Ramon",
    "Reina Mercedes",
    "Roxas",
    "San Agustin",
    "San Guillermo",
    "San Isidro",
    "San Manuel",
    "San Mariano",
    "San Mateo",
    "San Pablo",
    "Santa Maria",
    "Santiago City",
    "Santo Tomas",
    "Tumauini"
    ],
    "kalinga": [
    "Balbalan",
    "Lubuagan",
    "Pasil",
    "Pinukpuk",
    "Rizal",
    "Tabuk City",
    "Tanudan",
    "Tinglayan"
    ],
    "la_union": [
    "Agoo",
    "Aringay",
    "Bacnotan",
    "Bagulin",
    "Balaoan",
    "Bangar",
    "Bauang",
    "Burgos",
    "Caba",
    "Luna",
    "Naguilian",
    "Pugo",
    "Rosario",
    "San Fernando City",
    "San Gabriel",
    "San Juan",
    "Santo Tomas",
    "Santol",
    "Sudipen",
    "Tubao"
    ],
    "laguna": [
    "Alaminos",
    "Bay",
    "Biñan City",
    "Cabuyao City",
    "Calamba City",
    "Calauan",
    "Cavinti",
    "Famy",
    "Kalayaan",
    "Liliw",
    "Luisiana",
    "Lumban",
    "Mabitac",
    "Magdalena",
    "Majayjay",
    "Nagcarlan",
    "Nature and Science City of Los Baños",
    "Paete",
    "Pagsanjan",
    "Pakil",
    "Pangil",
    "Pila",
    "Rizal",
    "San Pablo City",
    "San Pedro",
    "Santa Cruz",
    "Santa Maria",
    "Santa Rosa City",
    "Siniloan",
    "Victoria"
    ],
    "lanao_del_norte": [
    "Bacolod",
    "Baloi",
    "Baroy",
    "Iligan City",
    "Kapatagan",
    "Kauswagan",
    "Kolambugan",
    "Lala",
    "Linamon",
    "Magsaysay",
    "Maigo",
    "Matungao",
    "Munai",
    "Nunungan",
    "Pantao Ragat",
    "Pantar",
    "Poona Piagapo",
    "Salvador",
    "Sapad",
    "Sultan Naga Dimaporo",
    "Tagoloan",
    "Tangcal",
    "Tubod"
    ],
    "lanao_del_sur": [
    "Bacolod-Kalawi",
    "Balabagan",
    "Balindong",
    "Bayang",
    "Binidayan",
    "Buadiposo-Buntong",
    "Bubong",
    "Bumbaran",
    "Butig",
    "Calanogas",
    "Ditsaan-Ramain",
    "Ganassi",
    "Kapai",
    "Kapatagan",
    "Lumba-Bayabao",
    "Lumbaca-Unayan",
    "Lumbatan",
    "Lumbayanague",
    "Madalum",
    "Madamba",
    "Maguing",
    "Malabang",
    "Marantao",
    "Marawi City",
    "Marogong",
    "Masiu",
    "Mulondo",
    "Pagayawan",
    "Piagapo",
    "Poona Bayabao",
    "Pualas",
    "Saguiaran",
    "Sultan Dumalondong",
    "Picong",
    "Tagoloan II",
    "Tamparan",
    "Taraka",
    "Tubaran",
    "Tugaya",
    "Wao"
    ],
    "leyte": [
    "Abuyog",
    "Alangalang",
    "Albuera",
    "Babatngon",
    "Barugo",
    "Bato",
    "Baybay City",
    "Burauen",
    "Calubian",
    "Capoocan",
    "Carigara",
    "Dagami",
    "Dulag",
    "Hilongos",
    "Hindang",
    "Inopacan",
    "Isabel",
    "Jaro",
    "Javier",
    "Julita",
    "Kananga",
    "La Paz",
    "Leyte",
    "MacArthur",
    "Mahaplag",
    "Matag-ob",
    "Matalom",
    "Mayorga",
    "Merida",
    "Ormoc City",
    "Palo",
    "Palompon",
    "Pastrana",
    "San Isidro",
    "San Miguel",
    "Santa Fe",
    "Tabango",
    "Tabontabon",
    "Tacloban City",
    "Tanauan",
    "Tolosa",
    "Tunga",
    "Villaba"
    ],
    "maguindanao": [
    "Ampatuan",
    "Barira",
    "Buldon",
    "Buluan",
    "Cotabato City",
    "Datu Abdullah Sangki",
    "Datu Anggal Midtimbang",
    "Datu Blah T. Sinsuat",
    "Datu Hoffer Ampatuan",
    "Datu Montawal",
    "Datu Odin Sinsuat",
    "Datu Paglas",
    "Datu Piang",
    "Datu Salibo",
    "Datu Saudi-Ampatuan",
    "Datu Unsay",
    "General Salipada K. Pendatun",
    "Guindulungan",
    "Kabuntalan",
    "Mamasapano",
    "Mangudadatu",
    "Matanog",
    "Northern Kabuntalan",
    "Pagalungan",
    "Paglat",
    "Pandag",
    "Parang",
    "Rajah Buayan",
    "Shariff Aguak",
    "Shariff Saydona Mustapha",
    "South Upi",
    "Sultan Kudarat",
    "Sultan Mastura",
    "Sultan sa Barongis",
    "Talayan",
    "Talitay",
    "Upi"
    ],
    "marinduque": [
    "Boac",
    "Buenavista",
    "Gasan",
    "Mogpog",
    "Santa Cruz",
    "Torrijos"
    ],
    "masbate": [
    "Aroroy",
    "Baleno",
    "Balud",
    "Batuan",
    "Cataingan",
    "Cawayan",
    "Claveria",
    "Dimasalang",
    "Esperanza",
    "Mandaon",
    "Masbate City",
    "Milagros",
    "Mobo",
    "Monreal",
    "Palanas",
    "Pio V. Corpuz",
    "Placer",
    "San Fernando",
    "San Jacinto",
    "San Pascual",
    "Uson"
    ],
    "metro_manila": [
    "City of Manila",
    "Caloocan",
    "Las Piñas",
    "Makati",
    "Malabon",
    "Mandaluyong",
    "Marikina",
    "Muntinlupa",
    "Navotas",
    "Parañaque",
    "Pasay",
    "Pasig",
    "Pateros",
    "Quezon City",
    "San Juan",
    "Taguig",
    "Valenzuela"
    ],
    "misamis_occidental": [
    "Aloran",
    "Baliangao",
    "Bonifacio",
    "Calamba",
    "Clarin",
    "Concepcion",
    "Don Victoriano Chiongbian",
    "Jimenez",
    "Lopez Jaena",
    "Oroquieta City",
    "Ozamiz City",
    "Panaon",
    "Plaridel",
    "Sapang Dalaga",
    "Sinacaban",
    "Tangub City",
    "Tudela"
    ],
    "misamis_oriental": [
    "Alubijid",
    "Balingasag",
    "Balingoan",
    "Binuangan",
    "Cagayan de Oro",
    "Claveria",
    "El Salvador City",
    "Gingoog City",
    "Gitagum",
    "Initao",
    "Jasaan",
    "Kinoguitan",
    "Lagonglong",
    "Laguindingan",
    "Libertad",
    "Lugait",
    "Magsaysay",
    "Manticao",
    "Medina",
    "Naawan",
    "Opol",
    "Salay",
    "Sugbongcogon",
    "Tagoloan",
    "Talisayan",
    "Villanueva"
    ],
    "mountain_province": [
    "Barlig",
    "Bauko",
    "Besao",
    "Bontoc",
    "Natonin",
    "Paracelis",
    "Sabangan",
    "Sadanga",
    "Sagada",
    "Tadian"
    ],
    "negros_occidental": [
    "Bacolod City",
    "Bago City",
    "Binalbagan",
    "Cadiz City",
    "Calatrava",
    "Candoni",
    "Cauayan",
    "Enrique B. Magalona",
    "Escalante City",
    "Himamaylan City",
    "Hinigaran",
    "Hinoba-an",
    "Ilog",
    "Isabela",
    "Kabankalan City",
    "La Carlota City",
    "La Castellana",
    "Manapla",
    "Moises Padilla",
    "Murcia",
    "Pontevedra",
    "Pulupandan",
    "Sagay City",
    "Salvador Benedicto",
    "San Carlos City",
    "San Enrique",
    "Silay City",
    "Sipalay City",
    "Talisay City",
    "Toboso",
    "Valladolid",
    "Victorias City"
    ],
    "negros_oriental": [
    "Amlan",
    "Ayungon",
    "Bacong",
    "Bais City",
    "Basay",
    "Bindoy",
    "Bayawan City",
    "Canlaon City",
    "Dauin",
    "Dumaguete City",
    "Guihulngan City",
    "Jimalalud",
    "La Libertad",
    "Mabinay",
    "Manjuyod",
    "Pamplona",
    "San Jose",
    "Santa Catalina",
    "Siaton",
    "Sibulan",
    "Tanjay City",
    "Tayasan",
    "Valencia",
    "Vallehermoso",
    "Zamboanguita"
    ],
    "northern_samar": [
    "Allen",
    "Biri",
    "Bobon",
    "Capul",
    "Catarman",
    "Catubig",
    "Gamay",
    "Laoang",
    "Lapinig",
    "Las Navas",
    "Lavezares",
    "Lope de Vega",
    "Mapanas",
    "Mondragon",
    "Palapag",
    "Pambujan",
    "Rosario",
    "San Antonio",
    "San Isidro",
    "San Jose",
    "San Roque",
    "San Vicente",
    "Silvino Lobos",
    "Victoria"
    ],
    "nueva_ecija": [
    "Aliaga",
    "Bongabon",
    "Cabanatuan City",
    "Cabiao",
    "Carranglan",
    "Cuyapo",
    "Gabaldon",
    "Gapan City",
    "General Mamerto Natividad",
    "General Tinio",
    "Guimba",
    "Jaen",
    "Laur",
    "Licab",
    "Llanera",
    "Lupao",
    "Nampicuan",
    "Palayan City",
    "Pantabangan",
    "Peñaranda",
    "Quezon",
    "Rizal",
    "San Antonio",
    "San Isidro",
    "San Jose City",
    "San Leonardo",
    "Santa Rosa",
    "Santo Domingo",
    "Science City of Muñoz",
    "Talavera",
    "Talugtug",
    "Zaragoza"
    ],
    "nueva_vizcaya": [
    "Alfonso Castaneda",
    "Ambaguio",
    "Aritao",
    "Bagabag",
    "Bambang",
    "Bayombong",
    "Diadi",
    "Dupax del Norte",
    "Dupax del Sur",
    "Kasibu",
    "Kayapa",
    "Quezon",
    "Santa Fe",
    "Solano",
    "Villaverde"
    ],
    "occidental_mindoro": [
    "Abra de Ilog",
    "Calintaan",
    "Looc",
    "Lubang",
    "Magsaysay",
    "Mamburao",
    "Paluan",
    "Rizal",
    "Sablayan",
    "San Jose",
    "Santa Cruz"
    ],
    "oriental_mindoro": [
    "Baco",
    "Bansud",
    "Bongabong",
    "Bulalacao",
    "Calapan City",
    "Gloria",
    "Mansalay",
    "Naujan",
    "Pinamalayan",
    "Pola",
    "Puerto Galera",
    "Roxas",
    "San Teodoro",
    "Socorro",
    "Victoria"
    ],
    "palawan": [
    "Aborlan",
    "Agutaya",
    "Araceli",
    "Balabac",
    "Bataraza",
    "Brooke's Point",
    "Busuanga",
    "Cagayancillo",
    "Coron",
    "Culion",
    "Cuyo",
    "Dumaran",
    "El Nido",
    "Kalayaan",
    "Linapacan",
    "Magsaysay",
    "Narra",
    "Puerto Princesa City",
    "Quezon",
    "Rizal",
    "Roxas",
    "San Vicente",
    "Sofronio Española",
    "Taytay"
    ],
    "pampanga": [
    "Angeles City",
    "Apalit",
    "Arayat",
    "Bacolor",
    "Candaba",
    "Floridablanca",
    "Guagua",
    "Lubao",
    "Mabalacat City",
    "Macabebe",
    "Magalang",
    "Masantol",
    "Mexico",
    "Minalin",
    "Porac",
    "San Fernando City",
    "San Luis",
    "San Simon",
    "Santa Ana",
    "Santa Rita",
    "Santo Tomas",
    "Sasmuan"
    ],
    "pangasinan": [
    "Agno",
    "Aguilar",
    "Alaminos City",
    "Alcala",
    "Anda",
    "Asingan",
    "Balungao",
    "Bani",
    "Basista",
    "Bautista",
    "Bayambang",
    "Binalonan",
    "Binmaley",
    "Bolinao",
    "Bugallon",
    "Burgos",
    "Calasiao",
    "Dagupan City",
    "Dasol",
    "Infanta",
    "Labrador",
    "Laoac",
    "Lingayen",
    "Mabini",
    "Malasiqui",
    "Manaoag",
    "Mangaldan",
    "Mangatarem",
    "Mapandan",
    "Natividad",
    "Pozzorubio",
    "Rosales",
    "San Carlos City",
    "San Fabian",
    "San Jacinto",
    "San Manuel",
    "San Nicolas",
    "San Quintin",
    "Santa Barbara",
    "Santa Maria",
    "Santo Tomas",
    "Sison",
    "Sual",
    "Tayug",
    "Umingan",
    "Urbiztondo",
    "Urdaneta City",
    "Villasis"
    ],
    "quezon": [
    "Agdangan",
    "Alabat",
    "Atimonan",
    "Buenavista",
    "Burdeos",
    "Calauag",
    "Candelaria",
    "Catanauan",
    "Dolores",
    "General Luna",
    "General Nakar",
    "Guinayangan",
    "Gumaca",
    "Infanta",
    "Jomalig",
    "Lopez",
    "Lucban",
    "Lucena City",
    "Macalelon",
    "Mauban",
    "Mulanay",
    "Padre Burgos",
    "Pagbilao",
    "Panukulan",
    "Patnanungan",
    "Perez",
    "Pitogo",
    "Plaridel",
    "Polillo",
    "Quezon",
    "Real",
    "Sampaloc",
    "San Andres",
    "San Antonio",
    "San Francisco",
    "San Narciso",
    "Sariaya",
    "Tagkawayan",
    "Tayabas City",
    "Tiaong",
    "Unisan"
    ],
    "quirino": [
    "Aglipay",
    "Cabarroguis",
    "Diffun",
    "Maddela",
    "Nagtipunan",
    "Saguday"
    ],
    "rizal": [
    "Angono",
    "Antipolo City",
    "Baras",
    "Binangonan",
    "Cainta",
    "Cardona",
    "Jalajala",
    "Morong",
    "Pililla",
    "Rodriguez",
    "San Mateo",
    "Tanay",
    "Taytay",
    "Teresa"
    ],
    "romblon": [
    "Alcantara",
    "Banton",
    "Cajidiocan",
    "Calatrava",
    "Concepcion",
    "Corcuera",
    "Ferrol",
    "Looc",
    "Magdiwang",
    "Odiongan",
    "Romblon",
    "San Agustin",
    "San Andres",
    "San Fernando",
    "San Jose",
    "Santa Fe",
    "Santa Maria"
    ],
    "samar": [
    "Almagro",
    "Basey",
    "Calbayog City",
    "Calbiga",
    "Catbalogan City",
    "Daram",
    "Gandara",
    "Hinabangan",
    "Jiabong",
    "Marabut",
    "Matuguinao",
    "Motiong",
    "Pagsanghan",
    "Paranas",
    "Pinabacdao",
    "San Jorge",
    "San Jose De Buan",
    "San Sebastian",
    "Santa Margarita",
    "Santa Rita",
    "Santo Niño",
    "Tagapul-an",
    "Talalora",
    "Tarangnan",
    "Villareal",
    "Zumarraga"
    ],
    "sarangani": [
    "Alabel",
    "Glan",
    "Kiamba",
    "Maasim",
    "Maitum",
    "Malapatan",
    "Malungon"
    ],
    "siquijor": [
    "Enrique Villanueva",
    "Larena",
    "Lazi",
    "Maria",
    "San Juan",
    "Siquijor"
    ],
    "sorsogon": [
    "Barcelona",
    "Bulan",
    "Bulusan",
    "Casiguran",
    "Castilla",
    "Donsol",
    "Gubat",
    "Irosin",
    "Juban",
    "Magallanes",
    "Matnog",
    "Pilar",
    "Prieto Diaz",
    "Santa Magdalena",
    "Sorsogon City"
    ],
    "south_cotabato": [
    "Polomolok (Applied for cityhood)",
    "Banga",
    "General Santos City",
    "Koronadal City",
    "Lake Sebu",
    "Norala",
    "Santo Niño",
    "Surallah",
    "T'boli",
    "Tampakan",
    "Tantangan",
    "Tupi"
    ],
    "southern_leyte": [
    "Anahawan",
    "Bontoc",
    "Hinunangan",
    "Hinundayan",
    "Libagon",
    "Liloan",
    "Limasawa",
    "Macrohon",
    "Malitbog",
    "Maasin City",
    "Padre Burgos",
    "Pintuyan",
    "Saint Bernard",
    "San Francisco",
    "San Juan",
    "San Ricardo",
    "Silago",
    "Sogod",
    "Tomas Oppus"
    ],
    "sultan_kudarat": [
    "Bagumbayan",
    "Columbio",
    "Esperanza",
    "Isulan",
    "Kalamansig",
    "Lambayong",
    "Lebak",
    "Lutayan",
    "Palimbang",
    "President Quirino",
    "Senator Ninoy Aquino",
    "Tacurong City"
    ],
    "sulu": [
    "Banguingui",
    "Hadji Panglima Tahil",
    "Indanan",
    "Jolo",
    "Kalingalan Caluang",
    "Lugus",
    "Luuk",
    "Maimbung",
    "Old Panamao",
    "Omar",
    "Pandami",
    "Panglima Estino",
    "Pangutaran",
    "Parang",
    "Pata",
    "Patikul",
    "Siasi",
    "Talipao",
    "Tapul"
    ],
    "surigao_del_norte": [
    "Alegria",
    "Bacuag",
    "Burgos",
    "Claver",
    "Dapa",
    "Del Carmen",
    "General Luna",
    "Gigaquit",
    "Mainit",
    "Malimono",
    "Pilar",
    "Placer",
    "San Benito",
    "San Francisco",
    "San Isidro",
    "Santa Monica",
    "Sison",
    "Socorro",
    "Surigao City",
    "Tagana-an",
    "Tubod"
    ],
    "surigao_del_sur": [
    "Barobo",
    "Bayabas",
    "Bislig City",
    "Cagwait",
    "Cantilan",
    "Carmen",
    "Carrascal",
    "Cortes",
    "Hinatuan",
    "Lanuza",
    "Lianga",
    "Lingig",
    "Madrid",
    "Marihatag",
    "San Agustin",
    "San Miguel",
    "Tagbina",
    "Tago",
    "Tandag City"
    ],
    "tarlac": [
    "Anao",
    "Bamban",
    "Camiling",
    "Capas",
    "Concepcion",
    "Gerona",
    "La Paz",
    "Mayantoc",
    "Moncada",
    "Paniqui",
    "Pura",
    "Ramos",
    "San Clemente",
    "San Jose",
    "San Manuel",
    "Santa Ignacia",
    "Tarlac City",
    "Victoria",
    "Tawi-Taw"
    ],
    "tawi-tawi": [
    "Bongao",
    "Languyan",
    "Mapun",
    "Panglima Sugala",
    "Sapa-Sapa",
    "Sibutu",
    "Simunul",
    "Sitangkai",
    "South Ubian",
    "Tandubas",
    "Turtle Islands",
    "Zambales"
    ],
    "zambales": [
    "Botolan",
    "Cabangan",
    "Candelaria",
    "Castillejos",
    "Iba",
    "Masinloc",
    "Olongapo City",
    "Palauig",
    "San Antonio",
    "San Felipe",
    "San Marcelino",
    "San Narciso",
    "Santa Cruz",
    "Subic"
    ],
    "zamboanga_del_norte": [
    "Bacungan",
    "Baliguian",
    "Dapitan City",
    "Dipolog City",
    "Godod",
    "Gutalac",
    "Jose Dalman",
    "Kalawit",
    "Katipunan",
    "La Libertad",
    "Labason",
    "Liloy",
    "Manukan",
    "Mutia",
    "Piñan",
    "Polanco",
    "President Manuel A. Roxas",
    "Rizal",
    "Salug",
    "Sergio Osmeña Sr.",
    "Siayan",
    "Sibuco",
    "Sibutad",
    "Sindangan",
    "Siocon",
    "Sirawai",
    "Tampilisan"
    ],
    "zamboanga_del_sur": [
    "Aurora",
    "Bayog",
    "Dimataling",
    "Dinas",
    "Dumalinao",
    "Dumingag",
    "Guipos",
    "Josefina",
    "Kumalarang",
    "Labangan",
    "Lakewood",
    "Lapuyan",
    "Mahayag",
    "Margosatubig",
    "Midsalip",
    "Molave",
    "Pagadian City",
    "Pitogo",
    "Ramon Magsaysay",
    "San Miguel",
    "San Pablo",
    "Sominot",
    "Tabina",
    "Tambulig",
    "Tigbao",
    "Tukuran",
    "Vincenzo A. Sagun",
    "Zamboanga City"
    ],
    "zamboanga_sibugay": [
        "Alicia",
        "Buug",
        "Diplahan",
        "Imelda",
        "Ipil",
        "Kabasalan",
        "Mabuhay",
        "Malangas",
        "Naga",
        "Olutanga",
        "Payao",
        "Roseller Lim",
        "Siay",
        "Talusan",
        "Titay",
        "Tungawan"
    ]
};