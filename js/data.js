// Small local JSON dataset used for instant autocomplete suggestions
const LOCAL_PLACES=[
["Springfield","City","Illinois","United States"],["Springfield","City","Massachusetts","United States"],["Springfield","City","Missouri","United States"],
["Paris","City","Île-de-France","France"],["Paris","City","Texas","United States"],
["Cambridge","City","England","United Kingdom"],["Cambridge","City","Massachusetts","United States"],
["Richmond","City","Virginia","United States"],["Richmond","Borough","London","United Kingdom"],
["Hyderabad","City","Telangana","India"],["Hyderabad","City","Sindh","Pakistan"],
["Bengaluru","City","Karnataka","India"],["Lalbagh Botanical Garden","Park","Bengaluru","India"],["Cubbon Park","Park","Bengaluru","India"],
["Church Street","Street","Bengaluru","India"],["MG Road","Street","Bengaluru","India"],["Indiranagar","Neighbourhood","Bengaluru","India"],
["Bengaluru Palace","Landmark","Bengaluru","India"],["Christ University","University","Bengaluru","India"],
["Kempegowda International Airport","Airport","Bengaluru","India"],["Taj Mahal","Landmark","Uttar Pradesh","India"],
["Eiffel Tower","Landmark","Paris","France"],["Central Park","Park","New York","United States"],
["Sydney Opera House","Landmark","New South Wales","Australia"],["Tokyo Tower","Landmark","Tokyo","Japan"]
].map(([name,type,region,country])=>({name,type,region,country}));
