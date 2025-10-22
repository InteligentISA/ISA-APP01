import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationSelectProps {
  onLocationChange: (county: string, constituency: string, ward?: string) => void;
  required?: boolean;
  initialLocation?: { county: string; constituency: string; ward?: string };
}

const locationData = {
  "Baringo County": ["Baringo North", "Baringo Central", "Baringo South", "Mogotio", "Eldama Ravine", "Tiaty"],
  "Bomet County": ["Bomet East", "Bomet Central", "Sotik", "Chepalungu", "Konoin"],
  "Bungoma County": ["Mt. Elgon", "Sirisia", "Kabuchai", "Bumula", "Kanduyi", "Webuye East", "Webuye West", "Kimilili", "Tongaren"],
  "Busia County": ["Teso North", "Teso South", "Nambale", "Matayos", "Butula", "Funyula", "Budalangi"],
  "Elgeyo-Marakwet County": ["Marakwet East", "Marakwet West", "Keiyo North", "Keiyo South"],
  "Embu County": ["Manyatta", "Runyenjes", "Mbeere South", "Mbeere North"],
  "Garissa County": ["Garissa Township", "Balambala", "Lagdera", "Dadaab", "Fafi", "Ijara"],
  "Homa Bay County": ["Kasipul", "Kabondo Kasipul", "Karachuonyo", "Rangwe", "Homa Bay Town", "Ndhiwa", "Suba North", "Suba South"],
  "Isiolo County": ["Isiolo North", "Isiolo South"],
  "Kajiado County": ["Kajiado North", "Kajiado Central", "Kajiado East", "Kajiado West", "Kajiado South"],
  "Kakamega County": ["Lugari", "Likuyani", "Malava", "Lurambi", "Navakholo", "Mumias West", "Mumias East", "Matungu", "Butere", "Khwisero", "Shinyalu", "Ikolomani"],
  "Kericho County": ["Kipkelion East", "Kipkelion West", "Ainamoi", "Bureti", "Belgut", "Sigowet/Soin"],
  "Kiambu County": ["Gatundu South", "Gatundu North", "Juja", "Thika Town", "Ruiru", "Githunguri", "Kiambu", "Kiambaa", "Kabete", "Kikuyu", "Limuru", "Lari"],
  "Kilifi County": ["Kilifi North", "Kilifi South", "Kaloleni", "Rabai", "Ganze", "Malindi", "Magarini"],
  "Kirinyaga County": ["Mwea", "Gichugu", "Ndia", "Kirinyaga Central"],
  "Kisii County": ["Bonchari", "South Mugirango", "Bomachoge Borabu", "Bobasi", "Bomachoge Chache", "Nyaribari Masaba", "Nyaribari Chache", "Kitutu Chache North", "Kitutu Chache South"],
  "Kisumu County": ["Kisumu East", "Kisumu West", "Kisumu Central", "Seme", "Nyando", "Muhoroni", "Nyakach"],
  "Kitui County": ["Mwingi North", "Mwingi West", "Mwingi Central", "Kitui West", "Kitui Rural", "Kitui Central", "Kitui East", "Kitui South"],
  "Kwale County": ["Msambweni", "Lunga Lunga", "Matuga", "Kinango"],
  "Laikipia County": ["Laikipia West", "Laikipia East", "Laikipia North"],
  "Lamu County": ["Lamu East", "Lamu West"],
  "Machakos County": ["Machakos Town", "Mavoko", "Masinga", "Yatta", "Kangundo", "Matungulu", "Kathiani", "Mwala"],
  "Makueni County": ["Makueni", "Kaiti", "Kibwezi West", "Kibwezi East", "Kilome", "Mbooni"],
  "Mandera County": ["Mandera West", "Banissa", "Mandera North", "Mandera South", "Mandera East", "Lafey"],
  "Marsabit County": ["Moyale", "North Horr", "Saku", "Laisamis"],
  "Meru County": ["Igembe South", "Igembe Central", "Igembe North", "Tigania West", "Tigania East", "North Imenti", "Buuri", "Central Imenti", "South Imenti"],
  "Migori County": ["Rongo", "Awendo", "Suna East", "Suna West", "Uriri", "Nyatike", "Kuria West", "Kuria East"],
  "Mombasa County": ["Changamwe", "Jomba", "Kisauni", "Nyali", "Likoni", "Mvita"],
  "Murang'a County": ["Kangema", "Mathioya", "Kiharu", "Kigumo", "Maragwa", "Kandara", "Gatanga"],
  "Nairobi County": ["Westlands", "Dagoretti North", "Dagoretti South", "Langata", "Kibra", "Roysambu", "Kasarani", "Ruaraka", "Embakasi South", "Embakasi North", "Embakasi Central", "Embakasi East", "Embakasi West", "Makadara", "Kamukunji", "Starehe", "Mathare"],
  "Nakuru County": ["Njoro", "Molo", "Gilgil", "Naivasha", "Nakuru Town West", "Nakuru Town East", "Kuresoi South", "Kuresoi North", "Subukia", "Rongai", "Bahati"],
  "Nandi County": ["Tinderet", "Aldai", "Nandi Hills", "Chesumei", "Emgwen", "Mosop"],
  "Narok County": ["Kajiado North", "Transmara West", "Transmara East", "Narok North", "Narok East", "Narok South", "Narok West"],
  "Nyamira County": ["West Mugirango", "North Mugirango", "Borabu", "Kitutu Masaba"],
  "Nyandarua County": ["Kinangop", "Kipipiri", "Ol Kalou", "Ol Joro Orok", "Ndaragwa"],
  "Nyeri County": ["Tetu", "Kieni", "Mathira", "Othaya", "Mukurweini", "Nyeri Town"],
  "Samburu County": ["Samburu West", "Samburu North", "Samburu East"],
  "Siaya County": ["Ugenya", "Ugunja", "Alego Usonga", "Gem", "Bondo", "Rarieda"],
  "Taita-Taveta County": ["Taveta", "Wundanyi", "Mwatate", "Voi"],
  "Tana River County": ["Garsen", "Galole", "Bura"],
  "Tharaka-Nithi County": ["Tharaka", "Chuka/Igambang'ombe", "Maara"],
  "Trans Nzoia County": ["Cherangany", "Endebess", "Saboti", "Kiminini", "Kwanza"],
  "Turkana County": ["Turkana North", "Turkana West", "Turkana Central", "Loima", "Turkana South", "Turkana East"],
  "Uasin Gishu County": ["Soy", "Turbo", "Moiben", "Ainabkoi", "Kapseret", "Kesses"],
  "Vihiga County": ["Vihiga", "Sabatia", "Hamisi", "Luanda", "Emuhaya"],
  "Wajir County": ["Wajir North", "Wajir East", "Tarbaj", "Wajir West", "Eldas", "Wajir South"],
  "West Pokot County": ["Sigor", "Kacheliba", "Kapenguria", "West Pokot"]
};

// Counties with ward data (Nairobi, Kiambu, Kajiado, Machakos)
const countiesWithWards = ["Nairobi County", "Kiambu County", "Kajiado County", "Machakos County"];

// Ward data for specific counties
const wardData = {
  "Nairobi County": {
    "Westlands": ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"],
    "Dagoretti North": ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"],
    "Dagoretti South": ["Mutu-Ini", "Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"],
    "Langata": ["Karen", "Nairobi West", "Mugumu-Ini", "South C", "Nyayo Highrise"],
    "Kibra": ["Woodley/Kenyatta Golf Course", "Sarang'ombe", "Makina", "Lindi", "Laini Saba"],
    "Roysambu": ["Kahawa West", "Roysambu", "Githurai", "Kahawa", "Zimmerman"],
    "Kasarani": ["Kasarani", "Njiru", "Clay City", "Mwiki", "Ruai"],
    "Ruaraka": ["Utalii", "Korogocho", "Lucky Summer", "Mathare North", "Baba Dogo"],
    "Embakasi South": ["Kwa Njenga", "Imara Daima", "Kware", "Kwa Reuben", "Pipeline"],
    "Embakasi North": ["Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV", "Kariobangi North"],
    "Embakasi Central": ["Kayole North", "Kayole Central", "Kariobangi South", "Komarock", "Matopeni / Spring Valley"],
    "Embakasi East": ["Utawala", "Upper Savanna", "Lower Savanna", "Embakasi", "Mihango"],
    "Embakasi West": ["Umoja 1", "Umoja 2", "Mowlem", "Kariobangi south", "Maringo/ Hamza"],
    "Makadara": ["Viwandani", "Harambee", "Makongeni", "Pumwani", "Eastleigh North"],
    "Kamukunji": ["Eastleigh South", "Nairobi Central", "Airbase", "California", "Mgara"],
    "Starehe": ["Nairobi South", "Hospital", "Ngara", "Pangani", "Landimawe", "Ziwani / Kariokor"],
    "Mathare": ["Mlango Kubwa", "Kiamaiko", "Ngei", "Huruma", "Mabatini"]
  },
  "Kiambu County": {
    "Gatundu South": ["Kiamwangi", "Kiganjo", "Ndarugu", "Ngenda"],
    "Gatundu North": ["Gituamba", "Githobokoni", "Chania", "Mang'u"],
    "Juja": ["Murera", "Theta", "Juja", "Witeithie", "Kalimoni"],
    "Thika Town": ["Township", "Kamenu", "Hospital", "Gatuanyaga", "Ngoliba"],
    "Ruiru": ["Gitothua", "Biashara", "Gatongora", "Kahawa Sukari", "Kahawa Wendani", "Kiuu", "Mwiki", "Mwihoko"],
    "Githunguri": ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"],
    "Kiambu": ["Ting'gang'a", "Ndumberi", "Riabai", "Township"],
    "Kiambaa": ["Cianda", "Karuiri", "Ndenderu", "Muchatha", "Kihara"],
    "Kabete": ["Gitaru", "Muguga", "Nyathuna", "Kabete", "Uthiru"],
    "Kikuyu": ["Karai", "Nachu", "Sigona", "Kikuyu", "Kinoo"],
    "Limuru": ["Bibirioni", "Limuru Central", "Ndeiya", "Limuru East", "Ngecha Tigoni"],
    "Lari": ["Kijabe", "Nyanduma", "Kamburu", "Lari/Kirenga"]
  },
  "Kajiado County": {
    "Kajiado North": ["Olkeri", "Ongata Rongai", "Nkaimurunya", "Oloolua", "Ngong"],
    "Kajiado Central": ["Purko", "Ildamat", "Dalalekutuk", "Matapato North", "Matapato South"],
    "Kajiado East": ["Kaputiei North", "Kitengela", "Oloosirkon/Sholinke", "Kenyawa-Poka", "Imaroro"],
    "Kajiado West": ["Keekonyokie", "Iloodokilani", "Magadi", "Ewuaso Oonkidong'i", "Mosiro"],
    "Kajiado South": ["Entonet/Lenkisi", "Mbirikani/Eselen", "Keikuku", "Rombo", "Kimana"]
  },
  "Machakos County": {
    "Machakos Town": ["Kalama", "Mua", "Mutitini", "Machakos Central", "Mumbuni North", "Muvuti/Kiima-Kimwe", "Kola"],
    "Mavoko": ["Athi River", "Kinanie", "Muthwani", "Syokimau/Mulolongo"],
    "Masinga": ["Kivaa", "Masinga", "Central", "Ekalakala", "Muthesya", "Ndithini"],
    "Yatta": ["Ndalani", "Matuu", "Kithimani", "Ikomba", "Katangi"],
    "Kangundo": ["Kangundo North", "Kangundo Central", "Kangundo East", "Kangundo West"],
    "Matungulu": ["Tala", "Matungulu North", "Matungulu East", "Matungulu West", "Kyeleni"],
    "Kathiani": ["Mitaboni", "Kathiani Central", "Upper Kaewa/Iveti", "Lower Kaewa/Kaani"],
    "Mwala": ["Mbiuni", "Makutano/Mwala", "Masii", "Muthetheni", "Wamunyu", "Kibauni"]
  }
};

const LocationSelect = ({ onLocationChange, required = false, initialLocation }: LocationSelectProps) => {
  const [selectedCounty, setSelectedCounty] = useState(initialLocation?.county || "");
  const [selectedConstituency, setSelectedConstituency] = useState(initialLocation?.constituency || "");
  const [selectedWard, setSelectedWard] = useState(initialLocation?.ward || "");

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    setSelectedConstituency(""); // Reset constituency when county changes
    setSelectedWard(""); // Reset ward when county changes
    onLocationChange(county, "", "");
  };

  const handleConstituencyChange = (constituency: string) => {
    setSelectedConstituency(constituency);
    setSelectedWard(""); // Reset ward when constituency changes
    onLocationChange(selectedCounty, constituency, "");
  };

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    onLocationChange(selectedCounty, selectedConstituency, ward);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="county">County {required && "*"}</Label>
        <Select value={selectedCounty} onValueChange={handleCountyChange} required={required}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select County" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(locationData).map((county) => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCounty && (
        <div>
          <Label htmlFor="constituency">Constituency</Label>
          <Select value={selectedConstituency} onValueChange={handleConstituencyChange} required={required}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Constituency" />
            </SelectTrigger>
            <SelectContent>
              {locationData[selectedCounty as keyof typeof locationData].map((constituency) => (
                <SelectItem key={constituency} value={constituency}>
                  {constituency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ward selection - only show for counties with ward data */}
      {selectedCounty && selectedConstituency && countiesWithWards.includes(selectedCounty) && (
        <div>
          <Label htmlFor="ward">Ward</Label>
          <Select value={selectedWard} onValueChange={handleWardChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Ward (Optional)" />
            </SelectTrigger>
            <SelectContent>
              {wardData[selectedCounty as keyof typeof wardData]?.[selectedConstituency]?.map((ward) => (
                <SelectItem key={ward} value={ward}>
                  {ward}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationSelect;
