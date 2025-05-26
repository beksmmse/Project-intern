export const ProductService = {
    getProductsData() {
        return [
            { id: '00001', name: 'วัดพระแก้ว', description: 'วัดศักดิ์สิทธิ์ในพระบรมมหาราชวัง', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.751841, lng: 100.492758 },
            { id: '00002', name: 'วัดอรุณราชวราราม', description: 'วัดริมแม่น้ำเจ้าพระยา', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.743626, lng: 100.488076 },
            { id: '00003', name: 'ศาลหลักเมือง', description: 'สถานที่ศักดิ์สิทธิ์ของกรุงเทพฯ', category: 'Point', inventoryStatus: 'PENDING', lat: 13.752796, lng: 100.494468 },
            { id: '00004', name: 'วัดโพธิ์', description: 'วัดพระเชตุพนวิมลมังคลาราม', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.746495, lng: 100.493024 },
            { id: '00005', name: 'เสาชิงช้า', description: 'แลนด์มาร์คใจกลางเมือง', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.752984, lng: 100.499237 },
            { id: '00006', name: 'สนามหลวง', description: 'สนามกลางเมืองสำหรับกิจกรรมสำคัญ', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.753143, lng: 100.492078 },
            { id: '00007', name: 'ถนนข้าวสาร', description: 'ถนนท่องเที่ยวยามค่ำ', category: 'Point', inventoryStatus: 'PENDING', lat: 13.759820, lng: 100.497720 },
            { id: '00008', name: 'เยาวราช', description: 'ถนนสายอาหารและวัฒนธรรมจีน', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.739278, lng: 100.510828 },
            { id: '00009', name: 'เซ็นทรัลเวิลด์', description: 'ศูนย์การค้าใจกลางกรุงเทพฯ', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.746131, lng: 100.539267 },
            { id: '00010', name: 'วัดสระเกศ (ภูเขาทอง)', description: 'วัดบนเนินเขาใจกลางเมือง', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.754029, lng: 100.506149 },
            { id: '00011', name: 'สวนลุมพินี', description: 'สวนสาธารณะขนาดใหญ่ในกลางกรุง', category: 'Point', inventoryStatus: 'PENDING', lat: 13.730061, lng: 100.541467 },
            { id: '00012', name: 'ตลาดนัดจตุจักร', description: 'ตลาดนัดจตุจักร กรุงเทพฯ', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.799596, lng: 100.553029 },
            { id: '00013', name: 'สยามพารากอน', description: 'ศูนย์การค้าและไลฟ์สไตล์', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.746574, lng: 100.534363 },
            { id: '00014', name: 'เอเชียทีค', description: 'ตลาดนัดริมน้ำเจ้าพระยา', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.705853, lng: 100.503346 },
            { id: '00015', name: 'บ้านศิลปินคลองบางหลวง', description: 'ศิลปะร่วมสมัยใจกลางชุมชน', category: 'Point', inventoryStatus: 'PENDING', lat: 13.718586, lng: 100.468517 },
            { id: '00016', name: 'สวนสัตว์ดุสิต', description: 'สวนสัตว์กลางกรุง', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.770340, lng: 100.514632 },
            { id: '00017', name: 'พระที่นั่งอนันตสมาคม', description: 'อาคารโดมสไตล์ยุโรป', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.774938, lng: 100.513669 },
            { id: '00018', name: 'ตลาดน้ำขวัญเรียม', description: 'ตลาดน้ำกรุงเทพฯฝั่งตะวันออก', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.789283, lng: 100.684067 },
            { id: '00019', name: 'วัดเบญจมบพิตร', description: 'วัดหินอ่อนกรุงเทพฯ', category: 'Point', inventoryStatus: 'PENDING', lat: 13.778693, lng: 100.514071 },
            { id: '00020', name: 'หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร', description: 'แหล่งศิลปะใจกลางเมือง', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.746438, lng: 100.530614 },
            { id: '00021', name: 'วัดราชนัดดา', description: 'โลหะปราสาทหนึ่งเดียวในโลก', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.754200, lng: 100.504845 },
            { id: '00022', name: 'ชุมชนตลาดพลู', description: 'แหล่งอาหารและขนมชื่อดัง', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.715564, lng: 100.473016 },
            { id: '00023', name: 'วัดบวรนิเวศ', description: 'วัดสำคัญย่านบางลำพู', category: 'Point', inventoryStatus: 'PENDING', lat: 13.759389, lng: 100.497297 },
            { id: '00024', name: 'ภูเขาทอง (วัดสระเกศ)', description: 'จุดชมวิวกรุงเทพฯ', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.754029, lng: 100.506149 },
            { id: '00025', name: 'ตลาดนัดรถไฟรัชดา', description: 'ตลาดกลางคืนยอดนิยม', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.767243, lng: 100.561661 },
            { id: '00026', name: 'สวนจตุจักร', description: 'สวนสาธารณะกลางกรุง', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.803251, lng: 100.551667 },
            { id: '00027', name: 'วัดราชบพิธ', description: 'วัดหลวงราชวงศ์', category: 'Point', inventoryStatus: 'PENDING', lat: 13.748636, lng: 100.497646 },
            { id: '00028', name: 'บ้านตุ๊กตาไทย', description: 'พิพิธภัณฑ์ตุ๊กตา', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.731660, lng: 100.515700 },
            { id: '00029', name: 'ท่ามหาราช', description: 'คอมมูนิตี้ริมแม่น้ำเจ้าพระยา', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.751194, lng: 100.489956 },
            { id: '00030', name: 'ไอคอนสยาม', description: 'ศูนย์การค้าริมเจ้าพระยา', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.726672, lng: 100.509700 },
            { id: '00031', name: 'สะพานพระพุทธยอดฟ้า', description: 'จุดชมวิวสะพานเก่า', category: 'Point', inventoryStatus: 'PENDING', lat: 13.744457, lng: 100.495253 },
            { id: '00032', name: 'สามย่านมิตรทาวน์', description: 'ศูนย์การค้าและไลฟ์สไตล์ใจกลางกรุง', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.732081, lng: 100.528915 },
            { id: '00033', name: 'ตลาดคลองสาน', description: 'ตลาดเก่าริมน้ำ', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.732606, lng: 100.508515 },
            { id: '00034', name: 'สวนเบญจกิติ', description: 'สวนป่าและสวนน้ำในเมือง', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.722880, lng: 100.556259 },
            { id: '00035', name: 'ตลาดอมรพันธ์', description: 'ตลาดสดใกล้มหาวิทยาลัย', category: 'Point', inventoryStatus: 'PENDING', lat: 13.829133, lng: 100.573191 },
            { id: '00036', name: 'ตลาดน้ำวัดศาลเจ้า', description: 'ตลาดน้ำย่านปทุมธานี', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.993010, lng: 100.539967 },
            { id: '00037', name: 'วัดไตรมิตร', description: 'พระพุทธรูปทองคำใหญ่', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.736105, lng: 100.516939 },
            { id: '00038', name: 'เซ็นทรัลลาดพร้าว', description: 'ศูนย์การค้าขนาดใหญ่', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.816008, lng: 100.561425 },
            { id: '00039', name: 'บึงหนองบอน', description: 'สวนสาธารณะใหญ่ฝั่งตะวันออก', category: 'Point', inventoryStatus: 'PENDING', lat: 13.687856, lng: 100.656151 },
            { id: '00040', name: 'ตลาดนัดรัชโยธิน', description: 'ตลาดนัดกลางคืนขึ้นชื่อ', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.819183, lng: 100.562451 },
            { id: '00041', name: 'วัดมหาธาตุยุวราชรังสฤษฎิ์', description: 'วัดใหญ่ริมสนามหลวง', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.753457, lng: 100.492621 },
            { id: '00042', name: 'ตลาดน้ำบางน้ำผึ้ง', description: 'ตลาดน้ำสมุทรปราการ', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.669162, lng: 100.574532 },
            { id: '00043', name: 'ท่าเตียน', description: 'ท่าเรือเก่าแก่', category: 'Point', inventoryStatus: 'PENDING', lat: 13.744804, lng: 100.492196 },
            { id: '00044', name: 'บางกระเจ้า', description: 'ปอดของกรุงเทพฯ', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.660032, lng: 100.582678 },
            { id: '00045', name: 'เซ็นทรัลพระราม 9', description: 'ศูนย์การค้าย่านพระราม 9', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.757822, lng: 100.565853 },
            { id: '00046', name: 'พระพิฆเนศหน้าตึกอิตัลไทย', description: 'สิ่งศักดิ์สิทธิ์กลางเมือง', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.739170, lng: 100.567530 },
            { id: '00047', name: 'วัดปทุมวนาราม', description: 'วัดใจกลางสยาม', category: 'Point', inventoryStatus: 'PENDING', lat: 13.745932, lng: 100.533877 },
            { id: '00048', name: 'ศูนย์วัฒนธรรมแห่งประเทศไทย', description: 'แหล่งวัฒนธรรมสำหรับชมการแสดง', category: 'Point', inventoryStatus: 'APPROVED', lat: 13.766718, lng: 100.569386 },
            { id: '00049', name: 'วัดปากน้ำ', description: 'วัดมหาธาตุย่านฝั่งธน', category: 'Point', inventoryStatus: 'ACTIVE', lat: 13.712302, lng: 100.501763 },
            { id: '00050', name: 'เมืองโบราณสมุทรปราการ', description: 'แหล่งท่องเที่ยวประวัติศาสตร์', category: 'Point', inventoryStatus: 'INACTIVE', lat: 13.543805, lng: 100.597899 },
            { id: "00051", name: "เซ็นทรัลบางนา", description: "ศูนย์การค้าย่านฝั่งตะวันออก", category: "Point", inventoryStatus: "INACTIVE", lat: 13.667691, lng: 100.634543 },
            { id: "00052", name: "ตลาดนัดรถไฟศรีนครินทร์", description: "ตลาดกลางคืนยอดนิยม", category: "Point", inventoryStatus: "ACTIVE", lat: 13.692913, lng: 100.648398 },
            { id: "00053", name: "โรงพยาบาลศิริราช", description: "ศูนย์การแพทย์ชื่อดัง", category: "Point", inventoryStatus: "APPROVED", lat: 13.756330, lng: 100.485561 },
            { id: "00054", name: "เมกะ บางนา", description: "ศูนย์การค้าใหญ่เขตบางนา", category: "Point", inventoryStatus: "ACTIVE", lat: 13.641681, lng: 100.680420 },
            { id: "00055", name: "เซ็นทรัลพระราม 3", description: "ศูนย์การค้าย่านกรุงเกษม", category: "Point", inventoryStatus: "PENDING", lat: 13.688855, lng: 100.536954 },
            { id: "00056", name: "เซ็นทรัล ปิ่นเกล้า", description: "ศูนย์การค้าฝั่งธนฯ", category: "Point", inventoryStatus: "ACTIVE", lat: 13.780419, lng: 100.474653 },
            { id: "00057", name: "วัดไผ่เงิน", description: "วัดเก่าแก่ฝั่งพระราม 3", category: "Point", inventoryStatus: "INACTIVE", lat: 13.695621, lng: 100.524657 },
            { id: "00058", name: "เพลินนารี่ มอลล์", description: "ไลฟ์สไตล์มอลล์ย่านวัชรพล", category: "Point", inventoryStatus: "ACTIVE", lat: 13.862118, lng: 100.637982 },
            { id: "00059", name: "สวนรถไฟ", description: "สวนวิ่งสวนจักรยาน", category: "Point", inventoryStatus: "APPROVED", lat: 13.813945, lng: 100.553215 },
            { id: "00060", name: "เดอะมอลล์บางแค", description: "ศูนย์การค้าชั้นนำฝั่งธนบุรี", category: "Point", inventoryStatus: "APPROVED", lat: 13.704144, lng: 100.410294 },
        ];;
    },

    getProductsMini() {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    },

    getProductsSmall() {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    },

    getProducts() {
        return Promise.resolve(this.getProductsData());
    },

    getProductsWithOrdersSmall() {
        return Promise.resolve(this.getProductsWithOrdersData().slice(0, 10));
    },

    getProductsWithOrders() {
        return Promise.resolve(this.getProductsWithOrdersData());
    }
};
