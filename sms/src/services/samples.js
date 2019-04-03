export default class SampleData {

    static clients(count = 2) {
        let c = [
            { "id": 1, "type": "client", "code": "ace", "logo": "http://www.adhiyamaan.ac.in/anew/anti-ace-logo.jpg", "icon": "http://www.adhiyamaan.ac.in/anew/anti-ace-logo.jpg", "name": "Adhiyamaan College of Engg", "noClient": 1, "noEntity": 2, "noBranch": 5, "noDepartment": 10, "noBatch": 25, "noAdmin": 1, "noStudent": 200, "noStaff": 20 },
            { "id": 2, "type": "client", "code": "psg", "logo": "http://psgtech.edu/icaars2018/img/psglogo1.png", "icon": "http://psgtech.edu/icaars2018/img/psglogo1.png", "name": "PSG College of Technology", "noClient": 1, "noEntity": 2, "noBranch": 5, "noDepartment": 10, "noBatch": 25, "noAdmin": 1, "noStudent": 200, "noStaff": 20 }
        ];

        for (let i = 3; i < count; i++) {
            d.push({ ...c[1], id: i });
        }
        return d;
    }
}