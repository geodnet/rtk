// GEODNET RTK Portal - Main JavaScript

// ==========================================
// 1. MD5 Encryption Implementation (RFC-1321)
// ==========================================
function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  
  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}


// ==========================================
// 2. Coordinate System Data (Table 2)
// ==========================================
const coordinateSystems = [
  { id: 1, name: "NAD83(2011)", epoch: "2010.0", region: "USA and North America", code: "namerica" },
  { id: 2, name: "NAD83(PA11)", epoch: "2010.0", region: "USA Hawaii", code: "namerica" },
  { id: 3, name: "NAD83(MA11)", epoch: "2010.0", region: "Guam (GUM)", code: "asiapac" },
  { id: 4, name: "NAD83(CSRS)v7", epoch: "2010.0", region: "Canada (CAN)", code: "namerica" },
  { id: 5, name: "ETRS89(ETRF2000)(2010.0)", epoch: "2010.0", region: "Europe (EUR)", code: "europe" },
  { id: 6, name: "GDA2020(2020.0)", epoch: "2020.0", region: "Australia (AUS)", code: "asiapac" },
  { id: 7, name: "NZGD2000(2000.0)", epoch: "2000.0", region: "New Zealand (NZL)", code: "asiapac" },
  { id: 8, name: "TUREF(2005.0) = ITRF96(2005.0)", epoch: "2005.0", region: "Turkey (TUR)", code: "europe" },
  { id: 9, name: "ITRF2008(2005.0)", epoch: "2005.0", region: "India (IND)", code: "asiapac" },
  { id: 11, name: "ITRF2008(2011.811)", epoch: "2011.811", region: "Egypt (EGY)", code: "others" },
  { id: 12, name: "NGD2012(2012.0) = ITRF2008(2012.0)", epoch: "2012.0", region: "Nigeria (NGA)", code: "others" },
  { id: 13, name: "PGD2020 = ITRF2014(2020.044)", epoch: "2020.044", region: "Philippines (PHL)", code: "asiapac" },
  { id: 14, name: "ITRF2014(2010)", epoch: "2010.0", region: "Mexico (MEX)", code: "namerica" },
  { id: 15, name: "ITRF2014 current epoch", epoch: "Current", region: "Kenya (KEN)", code: "others" },
  { id: 16, name: "CGCS2000(2000.0) = ITRF97(2000.0)*", epoch: "2000.0", region: "China (CHN)", code: "asiapac" },
  { id: 17, name: "JGD2011(2011.3945) = ITRF2008(2011.3945)", epoch: "2011.3945", region: "Japan (JPN)", code: "asiapac" },
  { id: 18, name: "IGRS2013(2012.0) = ITRF2008(2012.0)", epoch: "2012.0", region: "Indonesia (IDN)", code: "asiapac" },
  { id: 19, name: "ITRF1991(1994.0)", epoch: "1994.0", region: "South Africa (ZAF)", code: "others" },
  { id: 20, name: "WGS84(G730)(1994.0)", epoch: "1994.0", region: "Sri Lanka (LKA)", code: "asiapac" },
  { id: 21, name: "ITRF2020(2025.0)", epoch: "2025.0", region: "Taiwan (TWN)", code: "asiapac" },
  { id: 22, name: "ITRF2014(2010)", epoch: "2010.0", region: "Thailand (THA)", code: "asiapac" },
  { id: 23, name: "KGD2002(2002.0) = ITRF2000(2002.0)", epoch: "2002.0", region: "South Korea (KOR)", code: "asiapac" },
  { id: 24, name: "MGRF2020(2020.0) = ITRF2020(2020.0)", epoch: "2020.0", region: "Malaysia (MYS)", code: "asiapac" },
  { id: 25, name: "MTRF2000(2004.0) = ITRF2000(2004.0)", epoch: "2004.0", region: "United Arab Emirates (ARE)", code: "others" },
  { id: 26, name: "SIRGAS2000(2000.4) = ITRF2000(2000.4)", epoch: "2000.4", region: "South America (SIRGAS grid)", code: "others" },
  { id: 27, name: "GGD = ITRF2008(2011.353)", epoch: "2011.353", region: "Georgia (GEO)", code: "others" },
  { id: 28, name: "WGS84(G2139)(20xx.5)", epoch: "Dynamic", region: "Other regions (Global Default)", code: "others" }
];


// ==========================================
// 3. Reseller API Reference Data
// ==========================================
const apiEndpoints = [
  {
    id: "user-create",
    title: "Create Account",
    desc: "Creates a new RTK NTRIP client username and password. Ensure that the username is globally unique within the GEODNET RTK ecosystem.",
    url: "https://rtk.geodnet.com/api/v3/user/create",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Your unique application identification key provided by GEODNET." },
      { name: "username", type: "String", req: "Y", desc: "Desired RTK username (must be unique)." },
      { name: "password", type: "String", req: "Y", desc: "RTK account password." },
      { name: "trialDays", type: "Number", req: "Y", desc: "Free trial duration in days. Minimum is 1." },
      { name: "email", type: "String", req: "N", desc: "Associated user email address." },
      { name: "paymentType", type: "Number", req: "N", desc: "Billing type: 0 = Monthly (default), 1 = Yearly." },
      { name: "time", type: "Number", req: "Y", desc: "Current client Unix timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 hashed signature calculated from request parameters." }
    ],
    response: {
      code: 1000,
      msg: "OK"
    }
  },
  {
    id: "user-info",
    title: "Query Account",
    desc: "Retrieve detailed subscription parameters, status, and maximum concurrent connections of a specific RTK user account.",
    url: "https://rtk.geodnet.com/api/v3/user/info",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username to query." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK",
      data: {
        username: "geoduser",
        password: "geodpass",
        email: "user@example.com",
        expiration: 1718792318595,
        status: 0,
        connections: 1,
        paymentType: 0
      }
    }
  },
  {
    id: "user-list",
    title: "Query User List",
    desc: "Query the paginated list of all RTK user accounts associated with this reseller appId. Supports fuzzy prefix username searches.",
    url: "https://rtk.geodnet.com/api/v3/user/list",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "page", type: "Number", req: "Y", desc: "Page index (1-indexed)." },
      { name: "pageSize", type: "Number", req: "N", desc: "Items per page (multiple of 10, max 100, default: 20)." },
      { name: "username", type: "String", req: "N", desc: "Fuzzy query search parameter." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK",
      data: {
        total: 120,
        page: 1,
        pageSize: 20,
        list: [
          { username: "geoduser1", password: "pwd", status: 0, connections: 1, creationTime: 1680368829760, activationTime: 1680369000000, expirationTime: 1682960829760 },
          { username: "geoduser2", password: "pwd", status: 1, connections: 1, creationTime: 1680368859760, activationTime: 0, expirationTime: 0 }
        ]
      }
    }
  },
  {
    id: "update-expiration",
    title: "Extend Expiration Time",
    desc: "Updates the subscription validity of a specific RTK user by setting a new expiration date.",
    url: "https://rtk.geodnet.com/api/v3/user/update/expiration",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username." },
      { name: "expiration", type: "Number", req: "Y", desc: "New expiration timestamp in milliseconds." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK"
    }
  },
  {
    id: "update-password",
    title: "Update Password",
    desc: "Allows programmatically resetting an RTK user account's password to force configuration changes on the rover.",
    url: "https://rtk.geodnet.com/api/v3/user/update/password",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username." },
      { name: "password", type: "String", req: "Y", desc: "New password value." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK"
    }
  },
  {
    id: "update-status",
    title: "Update Account Status",
    desc: "Enables or disables an RTK account. Disabled accounts cannot authenticate with the NTRIP Caster.",
    url: "https://rtk.geodnet.com/api/v3/user/update/status",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username." },
      { name: "status", type: "Number", req: "Y", desc: "Status state: 0 = Enabled, 1 = Disabled." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK"
    }
  },
  {
    id: "update-connections",
    title: "Update Connections Limit",
    desc: "Set the maximum allowed concurrent NTRIP logins for a single set of user credentials.",
    url: "https://rtk.geodnet.com/api/v3/user/update/connections",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username." },
      { name: "connections", type: "Number", req: "Y", desc: "Max concurrent logins allowed (e.g. 1, 2, 5)." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp in milliseconds." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK"
    }
  },
  {
    id: "query-rtk-logs",
    title: "Query NTRIP Logs",
    desc: "Query the real-time or historical login and data transmission logs of a rover username.",
    url: "https://rtk.geodnet.com/api/v3/user/rtk/logs",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "username", type: "String", req: "Y", desc: "Target username." },
      { name: "startTime", type: "Number", req: "Y", desc: "Start log window timestamp in ms." },
      { name: "endTime", type: "Number", req: "Y", desc: "End log window timestamp in ms (within 7 days of start)." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK",
      data: [
        { time: 1718150900000, type: "login", ip: "192.168.1.50", mountpoint: "AUTO", details: "Successful authentication" },
        { time: 1718151200000, type: "nmea", lat: 37.7749, lon: -122.4194, details: "Position updated" }
      ]
    }
  },
  {
    id: "query-coverage",
    title: "Query Coverage Polygon",
    desc: "Retrieve geographical polygon coordinates highlighting active RTK base station coverage ranges globally.",
    url: "https://rtk.geodnet.com/api/v3/coverage/polygon",
    method: "POST",
    params: [
      { name: "appId", type: "String", req: "Y", desc: "Application ID." },
      { name: "time", type: "Number", req: "Y", desc: "Client timestamp." },
      { name: "sign", type: "String", req: "Y", desc: "MD5 request signature." }
    ],
    response: {
      code: 1000,
      msg: "OK",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "US-001", range: 50000 },
            geometry: { type: "Polygon", coordinates: [[[-122.5, 37.7], [-122.3, 37.7], [-122.3, 37.9], [-122.5, 37.9], [-122.5, 37.7]]] }
          }
        ]
      }
    }
  }
];


// ==========================================
// 4. Hardware Catalog Data
// ==========================================
const hardwareCatalog = [
  // Chip-Level GNSS RTK
  {
    category: "chip",
    manufacturer: "u-blox",
    name: "UBX-F9000",
    specs: ["Multi-Band L1/L2/L5", "GPS/GLO/GAL/BDS", "Dual RTK engines", "Extremely Low Power"],
    description: "The core multi-band, multi-constellation hardware chip powering high-integration RTK setups. Ideal for advanced developers building customized boards.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART, SPI, I2C, USB",
    accuracy: "1.0 cm + 1 ppm CEP",
    link: "https://www.u-blox.com"
  },
  {
    category: "chip",
    manufacturer: "Unicore Communications",
    name: "NebulasIV UC4C0",
    specs: ["Triple-Band L1/L2/L5", "1408 Channels", "100Hz Update Rate", "Built-in anti-jamming"],
    description: "High-performance geodetic chip incorporating advanced triple-frequency tracking. Solves carrier phase integer ambiguity within seconds.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS, NavIC",
    interface: "UART, SPI, USB, CAN-Bus",
    accuracy: "0.8 cm + 1 ppm CEP",
    link: "https://www.unicorecomm.com"
  },
  {
    category: "chip",
    manufacturer: "Allystar",
    name: "HD8040 Series",
    specs: ["Dual-Band L1/L5", "40nm process", "Integrated LNA", "Low Cost"],
    description: "Ultra-compact dual-frequency RTK chip targeted at consumer products, IoT trackers, and micromobility smart bikes.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART, I2C",
    accuracy: "2.0 cm + 2 ppm CEP",
    link: "https://www.allystar.com"
  },
  {
    category: "chip",
    manufacturer: "Broadcom",
    name: "BCM47755",
    specs: ["Dual-Frequency L1/L5", "Smart Sensor Hub", "Low Power", "Mobile Integrated"],
    description: "Pioneering L1/L5 dual-frequency receiver chip engineered specifically for high-end smartphones, wearables, and tablet computers.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "I2C, SPI",
    accuracy: "30 cm (Autonomous) / DGNSS Support",
    link: "https://www.broadcom.com"
  },
  {
    category: "chip",
    manufacturer: "HYFIX",
    name: "H1",
    specs: ["Multi-Band L1/L2/L5", "GPS/GLO/GAL/BDS", "Low Cost", "High Integration"],
    description: "Designed for high-precision mass-market applications like e-bikes, micro-mobility, and IoT devices. Delivers centimeter accuracy at a fraction of the cost of legacy chips.",
    constellations: "GPS, GLONASS, Galileo, BeiDou",
    interface: "UART, I2C, SPI",
    accuracy: "1.0 cm + 1 ppm CEP",
    link: "https://hyfix.ai"
  },
  {
    category: "chip",
    manufacturer: "Airoha",
    name: "AG3335A",
    specs: ["Dual-Frequency L1+L5", "Ultra-Low Power", "12nm Process", "High Sensitivity"],
    description: "An ultra-low power, high-performance dual-frequency GNSS chip with standard RTK support. Extensively used in wearables, asset tracking, and consumer IoT.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS, IRNSS",
    interface: "UART, I2C, SPI",
    accuracy: "1.0 m (Autonomous) / Centimeter RTK support",
    link: "https://www.airoha.com"
  },
  {
    category: "chip",
    manufacturer: "STMicroelectronics",
    name: "Teseo V (Tesve5)",
    specs: ["Multi-Frequency L1/L2/L5", "Automotive Grade", "Raw measurement output", "High-Precision Positioning"],
    description: "Single-chip multi-frequency GNSS receiver offering raw measurement data output. Perfect for automotive, telematics, and autonomous driving applications requiring RTK integrations.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART, SPI, I2C, CAN, USB",
    accuracy: "Centimeter RTK support / Decimeter PPP",
    link: "https://www.st.com"
  },
  
  // Module-Level GNSS RTK
  {
    category: "module",
    manufacturer: "u-blox",
    name: "ZED-F9P",
    specs: ["Dual-Band L1/L2", "Integrated RTK engine", "184 Channels", "Standard SMA support"],
    description: "The global industry standard for cost-effective surveying, precision UAV autopilots, and robotic lawnmowers. Direct plug-and-play NTRIP compatibility.",
    constellations: "GPS, GLONASS, Galileo, BeiDou",
    interface: "UART, I2C, SPI, USB",
    accuracy: "1.0 cm + 1 ppm CEP",
    link: "https://www.u-blox.com"
  },
  {
    category: "module",
    manufacturer: "Septentrio",
    name: "Mosaic-X5",
    specs: ["Triple-Band L1/L2/L5", "AIM+ Anti-Jamming", "100Hz output", "Multi-frequency"],
    description: "Robust surface-mount GNSS module offering superior resilience to RF interference, jamming, and spoofing. Perfect for industrial installations.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS, NavIC",
    interface: "UART, USB, Ethernet, CAN",
    accuracy: "0.6 cm + 0.5 ppm CEP",
    link: "https://www.septentrio.com"
  },
  {
    category: "module",
    manufacturer: "Quectel",
    name: "LG69T (AP)",
    specs: ["Multi-Band RTK", "Integrated IMU (DR)", "Automotive Qualified", "CAN-Bus output"],
    description: "Multi-band GNSS RTK module integrated with dead-reckoning inertial sensors for continuous positioning in urban canyons and tunnels.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART, CAN-Bus",
    accuracy: "1.5 cm + 1 ppm CEP",
    link: "https://www.quectel.com"
  },
  {
    category: "module",
    manufacturer: "Unicore Communications",
    name: "UM980",
    specs: ["Triple-Frequency Multi-Constellation", "1408 Channels", "Centimeter RTK Engine", "17 x 22 mm compact size"],
    description: "Next-generation high-precision RTK positioning module. Supports full constellations and triple frequencies, featuring ultra-low power consumption and high reliability.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART, SPI, USB, I2C",
    accuracy: "0.8 cm (Horiz) / 1.5 cm (Vert)",
    link: "https://www.unicorecomm.com"
  },
  {
    category: "module",
    manufacturer: "Quectel",
    name: "LC29H",
    specs: ["Based on Airoha AG3335A", "Dual-Frequency L1/L5", "Centimeter RTK Engine", "Integrated IMU option"],
    description: "Dual-frequency multi-constellation GNSS module equipped with an internal RTK engine. Delivers centimeter-level accuracy for drones, mapping, and consumer robotics.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "UART",
    accuracy: "1.0 cm + 1 ppm CEP",
    link: "https://www.quectel.com"
  },
  {
    category: "module",
    manufacturer: "HYFIX",
    name: "H1P",
    specs: ["Multi-Band RTK Engine", "Centimeter Precision", "NTRIP Compatible", "Compact Form Factor"],
    description: "Dual-frequency module based on the H1 chip, providing complete RTK positioning solutions for UAVs, autonomous mowing, and GIS surveys.",
    constellations: "GPS, GLONASS, Galileo, BeiDou",
    interface: "UART, USB, SPI",
    accuracy: "1.0 cm + 1 ppm CEP",
    link: "https://hyfix.ai"
  },
  
  // Product-Level GNSS RTK
  {
    category: "product",
    manufacturer: "Bad Elf",
    name: "Bad Elf Flex / Flex Extreme",
    specs: ["Bluetooth GNSS", "Handheld GIS", "Direct NTRIP client", "Vetted with GEODNET"],
    description: "Survey-grade handheld receiver that pairs with iOS/Android. Perfect match for GEODNET. Enables centimeter workflows on mobile devices.",
    constellations: "GPS, GLONASS, Galileo, BeiDou",
    interface: "Bluetooth, USB-C, Wi-Fi",
    accuracy: "1.0 cm CEP (with GEODNET NTRIP)",
    link: "https://bad-elf.com"
  },
  {
    category: "product",
    manufacturer: "Emlid",
    name: "Reach RS3",
    specs: ["IMU Tilt Compensation", "Multi-band RTK", "Built-in LTE & LoRa", "IP67 Rugged"],
    description: "Popular, rugged smart receiver with tilt compensation. Has integrated NTRIP Client that links instantly to GEODNET casters.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "Bluetooth, Wi-Fi, LoRa, LTE",
    accuracy: "0.7 cm + 1 ppm CEP",
    link: "https://emlid.com"
  },
  {
    category: "product",
    manufacturer: "Trimble",
    name: "R12i GNSS System",
    specs: ["ProPoint RTK engine", "TIP Tilt technology", "Dual-battery system", "High-End Surveying"],
    description: "Elite enterprise surveying receiver featuring robust multipath tracking. Connects to GEODNET mountpoints for premium accuracy.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "Bluetooth, Wi-Fi, UHF, Cellular",
    accuracy: "0.8 cm (Horiz) / 1.5 cm (Vert)",
    link: "https://www.trimble.com"
  },
  {
    category: "product",
    manufacturer: "Leica Geosystems",
    name: "GS18 T Smart Antenna",
    specs: ["Calibration-Free Tilt", "SmartLink support", "Ultra-rugged body", "Survey Grade"],
    description: "High-speed geodetic antenna unaffected by magnetic disturbances. Delivers survey-grade performance with standard RTCM 3.2 streams.",
    constellations: "GPS, GLONASS, Galileo, BeiDou",
    interface: "Bluetooth, Wi-Fi, UHF, Cellular",
    accuracy: "0.8 cm (Horiz) / 1.5 cm (Vert)",
    link: "https://leica-geosystems.com"
  },
  {
    category: "product",
    manufacturer: "HYFIX",
    name: "GeoMeasure RTK Receiver",
    specs: ["IMU Tilt Compensation", "Bluetooth & Wi-Fi", "OLED Display", "IP67 Rugged"],
    description: "A lightweight, cost-effective geodetic RTK receiver designed for surveyors and construction layout. Works seamlessly with the GEODNET CORS network.",
    constellations: "GPS, GLONASS, Galileo, BeiDou, QZSS",
    interface: "Bluetooth, USB-C, Wi-Fi",
    accuracy: "0.8 cm (Horiz) / 1.5 cm (Vert)",
    link: "https://hyfix.ai"
  }
];


// Global coverage map reference
let rtkCoverageMap = null;

// ==========================================
// 5. Global State & App Setup
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initRouting();
  initMobileMenu();
  initCoordinateSystems();
  initApiReference();
  initApiSignatureCalculator();
  initKnowledgeBase();
  initHardwareCatalog();
  initCoverageChecker();
  initCoverageMap();
});

// ==========================================
// 6. Navigation and SPA Routing
// ==========================================
function initRouting() {
  const sections = document.querySelectorAll(".page-section");
  const navLinks = document.querySelectorAll(".nav-link");
  const pageTitle = document.getElementById("current-page-title");
  
  function route() {
    let hash = window.location.hash || "#dashboard";
    
    // De-activate all sections and navlinks
    sections.forEach(sec => sec.classList.remove("active"));
    navLinks.forEach(link => link.classList.remove("active"));
    
    // Find active section
    let activeSec = document.querySelector(hash);
    if (!activeSec) {
      activeSec = document.getElementById("dashboard");
      hash = "#dashboard";
    }
    
    activeSec.classList.add("active");
    
    // Highlight matching sidebar navlink
    const matchingLink = document.querySelector(`.nav-link[data-section="${hash.substring(1)}"]`);
    if (matchingLink) {
      matchingLink.classList.add("active");
      pageTitle.textContent = matchingLink.querySelector("span").textContent;
    }

    // Invalidate Leaflet map size when coverage tab is shown
    if (hash === "#coverage" && rtkCoverageMap) {
      setTimeout(() => {
        rtkCoverageMap.invalidateSize();
      }, 150);
    }
    
    // Scroll content panel to top
    window.scrollTo(0, 0);
  }
  
  window.addEventListener("hashchange", route);
  route(); // Run initially
}

// Mobile navigation drawer toggle
function initMobileMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("nav-overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
  
  menuBtn.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);
  
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    });
  });
}

// ==========================================
// 7. Coordinate Systems Lookup (Table 2)
// ==========================================
function initCoordinateSystems() {
  const tbody = document.getElementById("coord-table-body");
  const searchInput = document.getElementById("coord-search");
  const filterTabs = document.querySelectorAll("#coord-filter-tabs .filter-tab");
  
  let currentFilter = "all";
  let searchQuery = "";
  
  function renderTable() {
    tbody.innerHTML = "";
    
    const filtered = coordinateSystems.filter(sys => {
      const matchesFilter = currentFilter === "all" || sys.code === currentFilter;
      const matchesSearch = sys.name.toLowerCase().includes(searchQuery) ||
                            sys.region.toLowerCase().includes(searchQuery) ||
                            sys.epoch.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
    
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No coordinate systems found matching query.</td></tr>`;
      return;
    }
    
    filtered.forEach(sys => {
      const tr = document.createElement("tr");
      
      const tdNum = document.createElement("td");
      tdNum.textContent = sys.id;
      tr.appendChild(tdNum);
      
      const tdName = document.createElement("td");
      tdName.className = "td-code";
      tdName.textContent = sys.name;
      tr.appendChild(tdName);
      
      const tdEpoch = document.createElement("td");
      tdEpoch.textContent = sys.epoch;
      tr.appendChild(tdEpoch);
      
      const tdRegion = document.createElement("td");
      tdRegion.textContent = sys.region;
      tr.appendChild(tdRegion);
      
      const tdCode = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "badge";
      
      if (sys.code === "namerica") {
        badge.classList.add("badge-live");
        badge.textContent = "North America";
        badge.style.borderColor = "rgba(0, 242, 254, 0.3)";
        badge.style.color = "var(--primary)";
        badge.style.backgroundColor = "rgba(0, 242, 254, 0.05)";
      } else if (sys.code === "europe") {
        badge.classList.add("badge-live");
        badge.textContent = "Europe";
        badge.style.borderColor = "rgba(157, 78, 221, 0.3)";
        badge.style.color = "var(--secondary)";
        badge.style.backgroundColor = "rgba(157, 78, 221, 0.05)";
      } else if (sys.code === "asiapac") {
        badge.classList.add("badge-live");
        badge.textContent = "Asia-Pacific";
        badge.style.borderColor = "rgba(16, 185, 129, 0.3)";
        badge.style.color = "var(--success)";
        badge.style.backgroundColor = "rgba(16, 185, 129, 0.05)";
      } else {
        badge.classList.add("badge-live");
        badge.textContent = "Global/Others";
        badge.style.borderColor = "rgba(255, 255, 255, 0.1)";
        badge.style.color = "var(--text-secondary)";
        badge.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
      }
      
      tdCode.appendChild(badge);
      tr.appendChild(tdCode);
      
      tbody.appendChild(tr);
    });
  }
  
  // Search listener
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderTable();
  });
  
  // Filter tabs listeners
  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      renderTable();
    });
  });
  
  renderTable(); // Initial load
}

// ==========================================
// 8. Reseller API Docs & Playground
// ==========================================
let currentSelectedApiId = "user-create";
let currentCodeLanguage = "curl";

function initApiReference() {
  const menuList = document.getElementById("api-menu-list");
  const codeBox = document.getElementById("code-snippet-box");
  const responseBox = document.getElementById("api-response-box");
  const copyBtn = document.getElementById("copy-snippet-btn");
  const langBtns = document.querySelectorAll(".code-lang-btn");
  
  // Render sidebar menu
  menuList.innerHTML = "";
  apiEndpoints.forEach(api => {
    const a = document.createElement("a");
    a.className = `api-menu-item ${api.id === currentSelectedApiId ? 'active' : ''}`;
    a.setAttribute("data-api-id", api.id);
    a.innerHTML = `
      <span>${api.title}</span>
      <span class="api-method-badge post">${api.method}</span>
    `;
    
    a.addEventListener("click", () => {
      document.querySelectorAll(".api-menu-item").forEach(item => item.classList.remove("active"));
      a.classList.add("active");
      currentSelectedApiId = api.id;
      displayApiDetails(api.id);
    });
    
    menuList.appendChild(a);
  });
  
  // Language selectors
  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      langBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCodeLanguage = btn.getAttribute("data-lang");
      updateCodeSnippet();
    });
  });
  
  // Copy Snippet listener
  copyBtn.addEventListener("click", () => {
    const range = document.createRange();
    range.selectNode(codeBox);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
      document.execCommand("copy");
      const span = copyBtn.querySelector("span");
      span.textContent = "Copied!";
      setTimeout(() => span.textContent = "Copy", 2000);
    } catch(err) {
      console.error("Could not copy snippet", err);
    }
    
    window.getSelection().removeAllRanges();
  });
  
  // Initial display
  displayApiDetails(currentSelectedApiId);
}

function displayApiDetails(apiId) {
  const api = apiEndpoints.find(item => item.id === apiId);
  if (!api) return;
  
  document.getElementById("api-title").textContent = api.title;
  document.getElementById("api-desc").textContent = api.desc;
  document.getElementById("api-url").textContent = api.url;
  
  const paramsBody = document.getElementById("api-params-body");
  paramsBody.innerHTML = "";
  
  api.params.forEach(p => {
    const tr = document.createElement("tr");
    
    const tdName = document.createElement("td");
    tdName.className = "td-code";
    tdName.textContent = p.name;
    tr.appendChild(tdName);
    
    const tdType = document.createElement("td");
    tdType.textContent = p.type;
    tr.appendChild(tdType);
    
    const tdReq = document.createElement("td");
    if (p.req === "Y") {
      tdReq.className = "param-required";
      tdReq.textContent = "Y";
    } else {
      tdReq.className = "param-optional";
      tdReq.textContent = "N";
    }
    tr.appendChild(tdReq);
    
    const tdDesc = document.createElement("td");
    tdDesc.textContent = p.desc;
    tr.appendChild(tdDesc);
    
    paramsBody.appendChild(tr);
  });
  
  // Render response JSON
  document.getElementById("api-response-box").textContent = JSON.stringify(api.response, null, 2);
  
  updateCodeSnippet();
}

function updateCodeSnippet() {
  const codeBox = document.getElementById("code-snippet-box");
  const api = apiEndpoints.find(item => item.id === currentSelectedApiId);
  if (!api) return;
  
  // Generate sample payload fields
  const mockPayload = {};
  api.params.forEach(p => {
    if (p.name === "appId") mockPayload[p.name] = "geodnet";
    else if (p.name === "time") mockPayload[p.name] = 1718150400000;
    else if (p.name === "sign") mockPayload[p.name] = "8dd687e158219da6ccc689aef6c0a6a1";
    else if (p.type === "String") mockPayload[p.name] = p.name + "_val";
    else if (p.type === "Number") mockPayload[p.name] = 1;
    else mockPayload[p.name] = "";
  });
  
  const jsonString = JSON.stringify(mockPayload, null, 2);
  
  if (currentCodeLanguage === "curl") {
    codeBox.textContent = `curl -X POST "${api.url}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonString.replace(/'/g, "'\\''")}'`;
  } 
  else if (currentCodeLanguage === "js") {
    codeBox.textContent = `const payload = ${jsonString};

fetch("${api.url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`;
  } 
  else if (currentCodeLanguage === "python") {
    codeBox.textContent = `import requests

url = "${api.url}"
payload = ${jsonString.replace(/true/g, 'True').replace(/false/g, 'False')}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())`;
  }
}

// ==========================================
// 9. API Interactive Signature Calculator
// ==========================================
function initApiSignatureCalculator() {
  const appIdInput = document.getElementById("sig-appid");
  const appKeyInput = document.getElementById("sig-appkey");
  const timeInput = document.getElementById("sig-time");
  const setTimeBtn = document.getElementById("sig-current-time-btn");
  const addParamBtn = document.getElementById("add-param-row-btn");
  const paramsGrid = document.getElementById("sig-params-grid");
  
  // Set current server time initially
  timeInput.value = Date.now();
  
  // Dynamic parameters default rows (matching Create Account example in API docs)
  const defaultParams = [
    { key: "username", val: "geoduser" },
    { key: "password", val: "geodpass" },
    { key: "trialDays", val: "7" }
  ];
  
  defaultParams.forEach(p => addParamRow(p.key, p.val));
  
  // Setup listeners
  appIdInput.addEventListener("input", calculateSignature);
  appKeyInput.addEventListener("input", calculateSignature);
  timeInput.addEventListener("input", calculateSignature);
  
  setTimeBtn.addEventListener("click", () => {
    timeInput.value = Date.now();
    calculateSignature();
  });
  
  addParamBtn.addEventListener("click", () => {
    addParamRow("", "");
    calculateSignature();
  });
  
  function addParamRow(key, val) {
    const row = document.createElement("div");
    row.className = "param-row";
    
    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className = "input-ctrl param-key";
    keyInput.placeholder = "Key (e.g. trialDays)";
    keyInput.value = key;
    keyInput.addEventListener("input", calculateSignature);
    row.appendChild(keyInput);
    
    const valInput = document.createElement("input");
    valInput.type = "text";
    valInput.className = "input-ctrl param-val";
    valInput.placeholder = "Value";
    valInput.value = val;
    valInput.addEventListener("input", calculateSignature);
    row.appendChild(valInput);
    
    const delBtn = document.createElement("button");
    delBtn.className = "remove-row-btn";
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    delBtn.addEventListener("click", () => {
      row.remove();
      calculateSignature();
    });
    row.appendChild(delBtn);
    
    paramsGrid.appendChild(row);
  }
  
  function calculateSignature() {
    const appId = appIdInput.value.trim();
    const appKey = appKeyInput.value.trim();
    const timeVal = parseInt(timeInput.value, 10) || Date.now();
    
    // Construct active parameter list
    const params = [
      { key: "appId", value: appId },
      { key: "time", value: timeVal }
    ];
    
    const keyElements = document.querySelectorAll(".param-key");
    const valElements = document.querySelectorAll(".param-val");
    
    for (let i = 0; i < keyElements.length; i++) {
      const k = keyElements[i].value.trim();
      const v = valElements[i].value.trim();
      
      if (k) {
        // Parse numbers if applicable, else string
        const parsedVal = (!isNaN(v) && v !== "") ? Number(v) : v;
        params.push({ key: k, value: parsedVal });
      }
    }
    
    // 1. Sort parameters alphabetically by key (excluding sign and appKey)
    params.sort((a, b) => a.key.localeCompare(b.key));
    const sortedKeysList = params.map(p => p.key).join(",");
    document.getElementById("sig-out-keys").textContent = sortedKeysList;
    
    // 2. Concatenate parameter values
    const concatString = params.map(p => String(p.value)).join("");
    document.getElementById("sig-out-concat").textContent = concatString;
    
    // 3. Concat with appKey
    const preHashedString = concatString + appKey;
    document.getElementById("sig-out-final").textContent = preHashedString;
    
    // 4. Compute MD5 Hashed Sign
    const signResult = md5(preHashedString);
    document.getElementById("sig-out-signature").textContent = signResult;
    
    // Build JSON Request payload
    const finalRequestJson = {};
    params.forEach(p => {
      finalRequestJson[p.key] = p.value;
    });
    finalRequestJson["sign"] = signResult;
    
    document.getElementById("sig-out-json").textContent = JSON.stringify(finalRequestJson, null, 2);
  }
  
  calculateSignature(); // Initial calculation
}

// ==========================================
// 10. Knowledge Base Search & Dynamic Filter
// ==========================================
function initKnowledgeBase() {
  const searchInput = document.getElementById("kb-search");
  const catItems = document.querySelectorAll(".kb-cat-item");
  const articleCards = document.querySelectorAll(".kb-article-card");
  
  // Categorization sidebar scroll handler
  catItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      catItems.forEach(cat => cat.classList.remove("active"));
      item.classList.add("active");
      
      const targetId = item.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  
  // Search filter across KB articles
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    
    articleCards.forEach(card => {
      const title = card.querySelector(".kb-article-title").textContent.toLowerCase();
      const content = card.querySelector(".kb-content").textContent.toLowerCase();
      
      if (title.includes(q) || content.includes(q)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ==========================================
// 11. Hardware Catalog Search & Tab Filter
// ==========================================
function initHardwareCatalog() {
  const grid = document.getElementById("hw-grid-list");
  const tabBtns = document.querySelectorAll(".hw-tab-btn");
  const searchInput = document.getElementById("hw-search");
  
  let currentLevel = "chip";
  let searchQuery = "";
  
  function renderHardware() {
    grid.innerHTML = "";
    
    const filtered = hardwareCatalog.filter(item => {
      const matchesCategory = item.category === currentLevel;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery) ||
                            item.manufacturer.toLowerCase().includes(searchQuery) ||
                            item.description.toLowerCase().includes(searchQuery) ||
                            item.constellations.toLowerCase().includes(searchQuery) ||
                            item.specs.some(s => s.toLowerCase().includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
    
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">No hardware found matching your query in this category.</div>`;
      return;
    }
    
    filtered.forEach(hw => {
      const card = document.createElement("div");
      card.className = "card hardware-card";
      
      // Dynamic specs tags list
      const specsHtml = hw.specs.map(spec => `<span class="hw-spec-tag">${spec}</span>`).join("");
      
      card.innerHTML = `
        <div class="hw-header">
          <div>
            <div class="hw-manufacturer">${hw.manufacturer}</div>
            <h3 class="hw-name">${hw.name}</h3>
          </div>
        </div>
        <div class="hw-specs">${specsHtml}</div>
        <p class="hw-description">${hw.description}</p>
        <div class="hw-details">
          <div>
            <div class="hw-detail-title">Constellations</div>
            <div class="hw-detail-val">${hw.constellations}</div>
          </div>
          <div>
            <div class="hw-detail-title">Supported Ports</div>
            <div class="hw-detail-val">${hw.interface}</div>
          </div>
          <div style="grid-column: 1 / -1; margin-top: 4px;">
            <div class="hw-detail-title">Precision / Output</div>
            <div class="hw-detail-val" style="color: var(--primary); font-weight: 600;">${hw.accuracy}</div>
          </div>
        </div>
        <a href="${hw.link}" target="_blank" class="hw-link">
          <span>Official Website</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      `;
      
      grid.appendChild(card);
    });
  }
  
  // Tab listeners
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentLevel = btn.getAttribute("data-tab");
      renderHardware();
    });
  });
  
  // Search listener
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderHardware();
  });
  
  renderHardware(); // Initial load
}

// ==========================================
// 12. Estimated Regional Coverage Checker
// ==========================================
function initCoverageChecker() {
  const select = document.getElementById("coverage-checker-select");
  const resultDiv = document.getElementById("coverage-checker-result");
  
  if (!select || !resultDiv) return;
  
  const coverageData = {
    usa: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "NAD83(2011) [Epoch 2010.0]",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Full network density across continental USA, Alaska, and Hawaii. Supports 3-frequency centimeter positioning."
    },
    can: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "NAD83(CSRS)v7",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "High station density covering major metropolitan areas and agricultural zones in Southern Canada."
    },
    eur: {
      status: "Outstanding Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "ETRS89 (ETRF2000)",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Vibrant coverage across Germany, UK, France, Italy, Poland, and Spain. Connects seamlessly with local survey networks."
    },
    tur: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "TUREF(2005.0) = ITRF96",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Complete regional coverage mapped to local Turkish survey standards."
    },
    egy: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "ITRF2008 (2011.811)",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Moderate to high station density in Nile Delta region. Expansion ongoing."
    },
    nga: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "NGD2012 (2012.0) = ITRF2008",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Active clusters near Lagos, Abuja, and Port Harcourt. Verify local baselines."
    },
    phl: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "PGD2020 = ITRF2014",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Centimeter coverage available in Greater Manila, Cebu, and major agricultural provinces."
    },
    mex: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "ITRF2014 (2010)",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Broad coverage covering major municipal hubs, construction regions, and agricultural corridors."
    },
    ken: {
      status: "Moderate Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "ITRF2014 (Current Epoch)",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Active stations around Nairobi and Mombasa. Expansion actively planned."
    },
    chn: {
      status: "VRS Partner Coverage Only",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "CGCS2000(2000.0) = ITRF97*",
      caster: "Custom Partner Stream Needed",
      notes: "GEODNET does not operate direct base stations in this region. Virtual CORS streams are broadcasted via local partnerships on demand."
    },
    jpn: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "JGD2011(2011.3945) = ITRF2008",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Dense coverage across Tokyo, Osaka, Nagoya, and Kyushu regions. Excellent signal stability."
    },
    idn: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "IGRS2013(2012.0) = ITRF2008",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Growing network coverage in Java, Sumatra, and Bali. Short baselines in urban sectors."
    },
    zaf: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "ITRF1991 (1994.0)",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Reliable centimeter-level corrections in Johannesburg, Cape Town, Durban, and Pretoria."
    },
    twn: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "ITRF2020 (2025.0)",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Dense grid layout offering excellent fix reliability and sub-centimeter accuracies."
    },
    tha: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "ITRF2014 (2010)",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Broad coverage covering Bangkok and central agricultural plain regions."
    },
    kor: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "KGD2002(2002.0) = ITRF2000",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "High density CORS layout covering Seoul, Busan, and industrial zones."
    },
    mys: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "MGRF2020(2020.0) = ITRF2020",
      caster: "rtk.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 13.56.117.10)</span>",
      notes: "Centimeter corrections active in Kuala Lumpur and Penang. Verify local baselines."
    },
    are: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "MTRF2000(2004.0) = ITRF2000",
      caster: "eu.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 3.73.41.96)</span>",
      notes: "Robust coverage throughout Dubai, Abu Dhabi, and urban centers."
    },
    sam: {
      status: "Good Coverage",
      color: "var(--warning)",
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      datum: "SIRGAS2000(2000.4) = ITRF2000",
      caster: "sa.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 18.230.73.64)</span>",
      notes: "Strong coverage along coastal Brazil, Argentina, Colombia, and Chile agricultural grids."
    },
    aus: {
      status: "Excellent Coverage",
      color: "var(--success)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      datum: "GDA2020 (AUS) / NZGD2000 (NZL)",
      caster: "aus.geodnet.com:2101 <br><span style='color: var(--text-muted);'>(IP: 54.206.56.130)</span>",
      notes: "Extensive density covering major Australian and New Zealand cities and farming belts."
    }
  };
  
  function check() {
    const val = select.value;
    if (!val || !coverageData[val]) return;
    
    const info = coverageData[val];
    resultDiv.style.display = "block";
    resultDiv.style.backgroundColor = info.bgColor;
    resultDiv.style.borderColor = info.borderColor;
    resultDiv.style.color = "var(--text-primary)";
    
    resultDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
        <span style="font-weight: 700; font-size: 0.95rem; color: ${info.color};">${info.status}</span>
        <span class="badge" style="background-color: ${info.bgColor}; border-color: ${info.borderColor}; color: ${info.color}; font-size: 0.72rem;">${val.toUpperCase()}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; margin-bottom: 6px;">
        <div>
          <span style="color: var(--text-muted); font-size: 0.72rem;">Datum:</span><br>
          <strong style="color: var(--primary);">${info.datum}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); font-size: 0.72rem;">Caster:</span><br>
          <strong>${info.caster}</strong>
        </div>
      </div>
      <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.35; border-top: 1px solid var(--border-color); padding-top: 6px; margin: 0;">
        ${info.notes}
      </p>
    `;
  }
  
  select.addEventListener("change", check);
}

// ==========================================
// 13. Interactive RTK Coverage Map System
// ==========================================

// Lightweight Built-in 2D Delaunay Triangulation Engine (Fallback & Standalone)
class FastDelaunay {
  static from(points) {
    if (typeof Delaunator !== "undefined") {
      return Delaunator.from(points);
    }
    const n = points.length;
    const coords = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) {
      coords[2 * i] = points[i][0];
      coords[2 * i + 1] = points[i][1];
    }
    return new FastDelaunay(coords);
  }
  constructor(coords) {
    const n = coords.length >> 1;
    this.coords = coords;
    const maxTriangles = Math.max(2 * n - 5, 0);
    this._triangles = new Uint32Array(3 * maxTriangles);
    this._halfedges = new Int32Array(3 * maxTriangles);
    this.trianglesLen = 0;
    this.triangles = new Uint32Array(0);
    this.halfedges = new Int32Array(0);
    if (typeof Delaunator !== "undefined") {
      const d = new Delaunator(coords);
      this.triangles = d.triangles;
      this.halfedges = d.halfedges;
    }
  }
}

function initCoverageMap() {
  const mapContainer = document.getElementById("rtk-leaflet-map");
  if (!mapContainer || typeof L === "undefined") return;

  // State
  let allStations = [];
  let stationMarkers = [];
  let rangeCircles = [];
  let delaunayEdges = [];
  let selectedStation = null;
  let roverMarker = null;
  let baselineLine = null;
  let isPickingRoverLocation = false;

  // Elements
  const loader = document.getElementById("map-loader");
  const loaderText = document.getElementById("loader-status-text");
  const refreshBtn = document.getElementById("refresh-coverage-btn");
  const refreshIcon = document.getElementById("refresh-spinner-icon");
  const apiStatusBadge = document.getElementById("api-status-badge");
  const statusFilterSelect = document.getElementById("map-status-filter");
  const delaunayToggleSelect = document.getElementById("map-delaunay-toggle");
  const edgeDistToggleSelect = document.getElementById("map-edge-dist-toggle");
  const rangeToggleSelect = document.getElementById("map-range-toggle");
  const tileSelect = document.getElementById("map-tile-select");
  const searchInput = document.getElementById("map-search-input");
  const searchBtn = document.getElementById("map-search-btn");
  const locateBtn = document.getElementById("map-locate-btn");
  const regionBtns = document.querySelectorAll(".region-jump-btn");
  const viewportCountEl = document.getElementById("map-viewport-count");
  const legendDelaunayItem = document.getElementById("legend-delaunay-item");
  const legendDistItem = document.getElementById("legend-dist-item");
  const legendRangeItem = document.getElementById("legend-range-item");
  const legendRangeLabel = document.getElementById("legend-range-label");

  // Metrics Elements
  const statTotalEl = document.getElementById("stat-total-stations");
  const statActiveEl = document.getElementById("stat-active-stations");
  const statOnlineEl = document.getElementById("stat-online-stations");
  const statOfflineEl = document.getElementById("stat-offline-stations");
  const dashboardStatTotal = document.querySelector("#dashboard .stat-card:first-child .stat-val");

  // Inspector Elements
  const inspectorCard = document.getElementById("station-inspector-card");
  const inspectorBadge = document.getElementById("inspector-status-badge");
  const inspectorEmpty = document.getElementById("inspector-empty-state");
  const inspectorContent = document.getElementById("inspector-content");
  const inspectorId = document.getElementById("inspector-id");
  const inspectorName = document.getElementById("inspector-name");
  const inspectorLat = document.getElementById("inspector-lat");
  const inspectorLng = document.getElementById("inspector-lng");
  const inspectorCaster = document.getElementById("inspector-caster");
  const inspectorMountpoint = document.getElementById("inspector-mountpoint");
  const inspectorCopyBtn = document.getElementById("inspector-copy-coords-btn");
  const inspectorZoomBtn = document.getElementById("inspector-zoom-btn");

  // Baseline Analyzer Elements
  const roverLatInput = document.getElementById("rover-lat-input");
  const roverLngInput = document.getElementById("rover-lng-input");
  const roverAnalyzeBtn = document.getElementById("rover-analyze-btn");
  const roverPickBtn = document.getElementById("rover-click-map-btn");
  const baselineResultCard = document.getElementById("baseline-result-card");

  // 1. Initialize Leaflet Map
  const map = L.map("rtk-leaflet-map", {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,
    zoomControl: true,
    attributionControl: true
  });
  rtkCoverageMap = map;

  // Custom Canvas Renderer for high-performance rendering of ~20k points and ~45k mesh lines
  const canvasRenderer = L.canvas({ padding: 0.5, tolerance: 5 });

  // 2. Basemap Tile Layers (100% Free & No API Key / No Watermark Required)
  const tileLayers = {
    dark: L.layerGroup([
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
      }),
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        attribution: '',
        maxZoom: 16
      })
    ]),
    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }),
    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    })
  };

  let currentTileLayer = tileLayers.dark.addTo(map);

  tileSelect.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (tileLayers[selected]) {
      map.removeLayer(currentTileLayer);
      currentTileLayer = tileLayers[selected].addTo(map);
    }
  });

  // Layer groups for markers, Delaunay mesh, edge labels, & range circles
  const delaunayLayer = L.layerGroup().addTo(map);
  const rangeLayer = L.layerGroup().addTo(map);
  const markersLayer = L.layerGroup().addTo(map);
  const edgeLabelsLayer = L.layerGroup().addTo(map);
  const roverLayer = L.layerGroup().addTo(map);

  // Helper: Haversine distance in km
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper: Get Regional Caster info
  function getCasterInfo(lat, lng) {
    if (lat < 0 && lng > 110 && lng < 180) {
      return {
        region: "Australia & New Zealand",
        host: "aus.geodnet.com:2101",
        ip: "54.206.56.130"
      };
    }
    if (lat < 15 && lng > -120 && lng < -30) {
      return {
        region: "South America",
        host: "sa.geodnet.com:2101",
        ip: "18.230.73.64"
      };
    }
    if (lng >= -30 && lng <= 60) {
      return {
        region: "Europe & Middle East / Africa",
        host: "eu.geodnet.com:2101",
        ip: "3.73.41.96"
      };
    }
    return {
      region: "USA / Global / Asia",
      host: "rtk.geodnet.com:2101",
      ip: "13.56.117.10"
    };
  }

  // 3. Fetch Data from API
  async function fetchStationData() {
    if (loader) {
      loader.classList.remove("hidden");
      loaderText.textContent = "Connecting to GEODNET live API...";
    }
    if (refreshIcon) refreshIcon.style.animation = "mapSpin 1s linear infinite";

    try {
      const response = await fetch("https://rtk.geodnet.com/api/v2/coverage_stations");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const json = await response.json();
      if (!json || !Array.isArray(json.data)) throw new Error("Invalid API response format");

      allStations = json.data;

      // Update API Status badge
      if (apiStatusBadge) {
        apiStatusBadge.innerHTML = `<span class="pulse-dot" style="width: 6px; height: 6px; background: var(--primary); border-radius: 50%; display: inline-block; box-shadow: 0 0 8px var(--primary);"></span> Live API (${allStations.length.toLocaleString()})`;
      }

      // Compute statistics
      updateMetrics(allStations);

      // Render Stations & Delaunay Network on Map
      renderStations();

      if (loader) {
        loaderText.textContent = `Rendered ${allStations.length.toLocaleString()} stations`;
        setTimeout(() => loader.classList.add("hidden"), 300);
      }
    } catch (err) {
      console.error("Error fetching coverage stations API:", err);
      if (loaderText) loaderText.textContent = "Error loading live API. Retrying connection...";
      if (apiStatusBadge) {
        apiStatusBadge.innerHTML = `<span class="pulse-dot" style="width: 6px; height: 6px; background: var(--danger); border-radius: 50%; display: inline-block;"></span> API Offline`;
      }
      setTimeout(() => {
        if (loader) loader.classList.add("hidden");
      }, 1000);
    } finally {
      if (refreshIcon) refreshIcon.style.animation = "";
    }
  }

  // 4. Update Header Metrics
  function updateMetrics(stations) {
    let activeCount = 0;
    let onlineCount = 0;
    let offlineCount = 0;

    stations.forEach(s => {
      const st = (s.status || "").toUpperCase();
      if (st === "ACTIVE") activeCount++;
      else if (st === "ONLINE") onlineCount++;
      else offlineCount++;
    });

    const total = stations.length;
    const activePct = total ? ((activeCount / total) * 100).toFixed(1) : 0;
    const onlinePct = total ? ((onlineCount / total) * 100).toFixed(1) : 0;
    const offlinePct = total ? ((offlineCount / total) * 100).toFixed(1) : 0;

    if (statTotalEl) statTotalEl.textContent = total.toLocaleString();
    if (statActiveEl) statActiveEl.innerHTML = `${activeCount.toLocaleString()} <span style="font-size: 0.8rem; font-weight: 500; opacity: 0.85;">(${activePct}%)</span>`;
    if (statOnlineEl) statOnlineEl.innerHTML = `${onlineCount.toLocaleString()} <span style="font-size: 0.8rem; font-weight: 500; opacity: 0.85;">(${onlinePct}%)</span>`;
    if (statOfflineEl) statOfflineEl.innerHTML = `${offlineCount.toLocaleString()} <span style="font-size: 0.8rem; font-weight: 500; opacity: 0.85;">(${offlinePct}%)</span>`;

    if (dashboardStatTotal) {
      dashboardStatTotal.textContent = `${total.toLocaleString()}+`;
    }
  }

  // 5. Compute Delaunay Triangulation Network
  function buildDelaunayNetwork(stations) {
    delaunayEdges = [];
    if (!stations || stations.length < 3) return;

    try {
      const coords = stations.map(s => [s.lng, s.lat]);
      let delaunay = (typeof Delaunator !== "undefined") ? Delaunator.from(coords) : FastDelaunay.from(coords);
      if (!delaunay || !delaunay.triangles || delaunay.triangles.length === 0) return;

      const halfedges = delaunay.halfedges;
      const triangles = delaunay.triangles;

      for (let i = 0; i < halfedges.length; i++) {
        if (i > halfedges[i]) {
          const p1Index = triangles[i];
          const p2Index = triangles[i % 3 === 2 ? i - 2 : i + 1];
          const s1 = stations[p1Index];
          const s2 = stations[p2Index];
          if (!s1 || !s2) continue;

          const dist = calculateDistanceKm(s1.lat, s1.lng, s2.lat, s2.lng);
          // Filter out large cross-ocean triangles (> 250km) to keep realistic RTK baseline networks
          if (dist <= 250) {
            delaunayEdges.push({
              s1,
              s2,
              dist,
              lat1: s1.lat,
              lng1: s1.lng,
              lat2: s2.lat,
              lng2: s2.lng,
              midLat: (s1.lat + s2.lat) / 2,
              midLng: (s1.lng + s2.lng) / 2
            });
          }
        }
      }
    } catch (e) {
      console.error("Delaunay triangulation calculation failed:", e);
    }
  }

  // 6. Render Delaunay Mesh
  function renderDelaunayMesh() {
    delaunayLayer.clearLayers();
    edgeLabelsLayer.clearLayers();

    const showMesh = delaunayToggleSelect ? delaunayToggleSelect.value === "on" : true;
    if (legendDelaunayItem) legendDelaunayItem.style.display = showMesh ? "flex" : "none";
    if (legendDistItem) legendDistItem.style.display = showMesh ? "flex" : "none";

    if (!showMesh || delaunayEdges.length === 0) return;

    // Collect all polyline coordinates for ultra-fast canvas batch rendering
    const lineSegments = [];
    delaunayEdges.forEach(edge => {
      lineSegments.push([[edge.lat1, edge.lng1], [edge.lat2, edge.lng2]]);
    });

    const meshPolyline = L.polyline(lineSegments, {
      renderer: canvasRenderer,
      color: "#00F2FE",
      weight: 1.1,
      opacity: 0.35,
      interactive: false
    });

    delaunayLayer.addLayer(meshPolyline);

    // Update zoom-dependent edge length labels
    updateEdgeDistanceLabels();
  }

  // 7. Update Edge Distance Labels (Detailed View Only: Zoom >= 9)
  function updateEdgeDistanceLabels() {
    edgeLabelsLayer.clearLayers();

    const showMesh = delaunayToggleSelect ? delaunayToggleSelect.value === "on" : true;
    const distMode = edgeDistToggleSelect ? edgeDistToggleSelect.value : "auto";

    if (!showMesh || distMode === "off" || delaunayEdges.length === 0) return;

    const zoom = map.getZoom();

    // DETAILED VIEW CRITERION: Zoom >= 9
    // Do NOT show baseline lengths for non-detailed views (zoom < 9)
    if (zoom < 9) {
      return;
    }

    const bounds = map.getBounds();
    const visibleEdges = delaunayEdges.filter(edge => {
      return bounds.contains([edge.midLat, edge.midLng]);
    });

    // Limit maximum rendered badges in view to avoid clutter
    const maxLabels = 120;
    const step = Math.max(1, Math.floor(visibleEdges.length / maxLabels));

    for (let i = 0; i < visibleEdges.length; i += step) {
      const edge = visibleEdges[i];

      const labelIcon = L.divIcon({
        className: "delaunay-edge-label-wrap",
        html: `<div class="delaunay-edge-label">${edge.dist.toFixed(1)} km</div>`,
        iconSize: [42, 16],
        iconAnchor: [21, 8]
      });

      const marker = L.marker([edge.midLat, edge.midLng], {
        icon: labelIcon,
        interactive: true
      });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; font-size: 0.82rem; min-width: 210px;">
          <div style="font-weight: 700; color: #00F2FE; font-size: 0.9rem; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
            Delaunay RTK Baseline
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 0.75rem; color: #9ca3af;">
            <span>Node A:</span>
            <strong style="color: #f3f4f6; font-family: 'JetBrains Mono', monospace;">${edge.s1.stationId != null ? '#' + edge.s1.stationId + ' ' : ''}${edge.s1.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.75rem; color: #9ca3af;">
            <span>Node B:</span>
            <strong style="color: #f3f4f6; font-family: 'JetBrains Mono', monospace;">${edge.s2.stationId != null ? '#' + edge.s2.stationId + ' ' : ''}${edge.s2.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.15);">
            <span style="color: #9ca3af; font-size: 0.75rem;">Baseline Distance:</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${edge.dist <= 20 ? 'var(--success)' : (edge.dist <= 40 ? 'var(--primary)' : 'var(--warning)')}; font-size: 0.88rem;">
              ${edge.dist.toFixed(2)} km
            </span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
            ${edge.dist <= 20 ? 'Optimal Short Baseline (Instant Fix)' : (edge.dist <= 40 ? 'Standard Survey Baseline' : 'Extended Baseline')}
          </div>
        </div>
      `, { maxWidth: 260 });

      edgeLabelsLayer.addLayer(marker);
    }
  }

  // 8. Render Stations, Delaunay Network, and Range Buffers
  function renderStations() {
    markersLayer.clearLayers();
    rangeLayer.clearLayers();
    stationMarkers = [];
    rangeCircles = [];

    const statusFilter = statusFilterSelect ? statusFilterSelect.value : "ALL";
    const rangeVal = rangeToggleSelect ? rangeToggleSelect.value : "none";

    // Update legend range item visibility
    if (legendRangeItem && legendRangeLabel) {
      if (rangeVal === "none") {
        legendRangeItem.style.display = "none";
      } else {
        legendRangeItem.style.display = "flex";
        legendRangeLabel.textContent = `${rangeVal}km RTK Range`;
      }
    }

    const rangeMeters = (rangeVal === "20" || rangeVal === "40") ? parseInt(rangeVal) * 1000 : 0;

    // Filter stations
    const filteredStations = [];
    const activeStationsForMesh = [];

    allStations.forEach(station => {
      const st = (station.status || "OFFLINE").toUpperCase();
      if (statusFilter === "ALL" || st === statusFilter) {
        filteredStations.push(station);
      }
      if (st === "ACTIVE") {
        activeStationsForMesh.push(station);
      }
    });

    // Compute Delaunay triangulation on active stations
    buildDelaunayNetwork(activeStationsForMesh);
    renderDelaunayMesh();

    // Render station nodes
    filteredStations.forEach(station => {
      const st = (station.status || "OFFLINE").toUpperCase();

      let color = "#00F2FE";
      let fillColor = "#00F2FE";
      let fillOpacity = 0.75;
      let radius = 3.5;

      if (st === "ONLINE") {
        color = "#F59E0B";
        fillColor = "#F59E0B";
        fillOpacity = 0.75;
      } else if (st === "OFFLINE") {
        color = "#EF4444";
        fillColor = "#EF4444";
        fillOpacity = 0.45;
        radius = 2.8;
      }

      // Add station circle marker using high performance Canvas renderer
      const marker = L.circleMarker([station.lat, station.lng], {
        renderer: canvasRenderer,
        radius: radius,
        color: color,
        weight: 1,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      });

      marker.stationData = station;

      // Popup Content
      const caster = getCasterInfo(station.lat, station.lng);
      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #00F2FE; font-size: 1rem;">${station.name}</span>
            <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(${st === 'ACTIVE' ? '0, 242, 254' : (st === 'ONLINE' ? '245, 158, 11' : '239, 68, 68')}, 0.15); color: ${color}; font-weight: 600;">
              ${st}
            </span>
          </div>
          ${station.stationId != null ? `<div style="font-size: 0.76rem; color: #9ca3af; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">Station ID: <strong style="color: var(--primary); font-family: 'JetBrains Mono', monospace;">#${station.stationId}</strong></div>` : `<div style="margin-bottom: 6px;"></div>`}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.78rem; margin-bottom: 8px;">
            <div>
              <span style="color: #9ca3af; font-size: 0.7rem;">Latitude:</span><br>
              <strong style="color: #f3f4f6; font-family: 'JetBrains Mono', monospace;">${station.lat.toFixed(4)}°</strong>
            </div>
            <div>
              <span style="color: #9ca3af; font-size: 0.7rem;">Longitude:</span><br>
              <strong style="color: #f3f4f6; font-family: 'JetBrains Mono', monospace;">${station.lng.toFixed(4)}°</strong>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 4px;">
            Caster: <strong style="color: #f3f4f6;">${caster.host}</strong>
          </div>
          <div style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 10px;">
            Mountpoint: <span style="color: #9d4edd; font-weight: 600;">AUTO</span> (VRS / RTCM 3.2)
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-primary" onclick="window.inspectStationByName('${station.name}')" style="flex: 1; padding: 4px 8px; font-size: 0.75rem;">
              Inspect
            </button>
            <button class="btn btn-secondary" onclick="window.setRoverBaselineTarget(${station.lat}, ${station.lng})" style="flex: 1; padding: 4px 8px; font-size: 0.75rem;">
              Baseline
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, closeButton: true });

      marker.on("click", () => {
        inspectStation(station);
      });

      markersLayer.addLayer(marker);
      stationMarkers.push(marker);

      // Add range circle for active stations if enabled
      if (rangeMeters > 0 && st === "ACTIVE") {
        const circle = L.circle([station.lat, station.lng], {
          renderer: canvasRenderer,
          radius: rangeMeters,
          color: "rgba(0, 242, 254, 0.25)",
          weight: 0.8,
          fillColor: "#00F2FE",
          fillOpacity: 0.04,
          interactive: false
        });
        rangeLayer.addLayer(circle);
        rangeCircles.push(circle);
      }
    });

    updateViewportCount();
  }

  // 9. Update Visible Viewport Station Count
  function updateViewportCount() {
    if (!viewportCountEl) return;
    const bounds = map.getBounds();
    let count = 0;

    stationMarkers.forEach(m => {
      if (bounds.contains(m.getLatLng())) count++;
    });

    viewportCountEl.textContent = `Showing ${count.toLocaleString()} in view (${allStations.length.toLocaleString()} total)`;
  }

  map.on("moveend", () => {
    updateViewportCount();
    updateEdgeDistanceLabels();
  });

  map.on("zoomend", updateEdgeDistanceLabels);

  // 10. Inspect Selected Station in Sidebar
  function inspectStation(station) {
    selectedStation = station;
    if (!inspectorCard) return;

    if (inspectorEmpty) inspectorEmpty.style.display = "none";
    if (inspectorContent) inspectorContent.style.display = "block";

    const st = (station.status || "OFFLINE").toUpperCase();
    const isAct = st === "ACTIVE";
    const isOnline = st === "ONLINE";
    const statusColor = isAct ? "var(--primary)" : (isOnline ? "var(--warning)" : "var(--danger)");
    const statusBg = isAct ? "rgba(0, 242, 254, 0.12)" : (isOnline ? "rgba(245, 158, 11, 0.12)" : "rgba(239, 68, 68, 0.12)");

    if (inspectorBadge) {
      inspectorBadge.textContent = st;
      inspectorBadge.style.color = statusColor;
      inspectorBadge.style.background = statusBg;
      inspectorBadge.style.borderColor = statusColor;
    }

    if (inspectorId) {
      inspectorId.textContent = station.stationId != null ? `#${station.stationId}` : "--";
    }
    if (inspectorName) {
      inspectorName.textContent = station.name || "--";
    }
    if (inspectorLat) inspectorLat.textContent = `${station.lat.toFixed(5)}°`;
    if (inspectorLng) inspectorLng.textContent = `${station.lng.toFixed(5)}°`;

    const caster = getCasterInfo(station.lat, station.lng);
    if (inspectorCaster) {
      inspectorCaster.innerHTML = `<strong>${caster.host}</strong> <span style="font-size: 0.75rem; color: var(--text-muted);">(IP: ${caster.ip})</span>`;
    }

    if (inspectorMountpoint) {
      inspectorMountpoint.textContent = "AUTO / AUTO_WGS84 / AUTO_ITRF2020";
    }

    // Baseline rover helper sync
    if (roverLatInput && !roverLatInput.value) roverLatInput.value = station.lat.toFixed(4);
    if (roverLngInput && !roverLngInput.value) roverLngInput.value = station.lng.toFixed(4);
  }

  // Global helper for popup buttons
  window.inspectStationByName = (name) => {
    const found = allStations.find(s => s.name === name);
    if (found) inspectStation(found);
  };

  window.setRoverBaselineTarget = (lat, lng) => {
    if (roverLatInput) roverLatInput.value = lat.toFixed(5);
    if (roverLngInput) roverLngInput.value = lng.toFixed(5);
    calculateBaselineForCoords(lat, lng);
  };

  // 11. Inspector Action Buttons
  if (inspectorCopyBtn) {
    inspectorCopyBtn.addEventListener("click", () => {
      if (!selectedStation) return;
      const text = `${selectedStation.lat.toFixed(6)}, ${selectedStation.lng.toFixed(6)}`;
      navigator.clipboard.writeText(text).then(() => {
        const orig = inspectorCopyBtn.textContent;
        inspectorCopyBtn.textContent = "Copied!";
        setTimeout(() => inspectorCopyBtn.textContent = orig, 1500);
      });
    });
  }

  if (inspectorZoomBtn) {
    inspectorZoomBtn.addEventListener("click", () => {
      if (!selectedStation) return;
      map.flyTo([selectedStation.lat, selectedStation.lng], 13, { duration: 1.2 });
    });
  }

  // 12. Baseline Analyzer Calculation
  function calculateBaselineForCoords(roverLat, roverLng) {
    if (isNaN(roverLat) || isNaN(roverLng)) return;

    // Find closest ACTIVE station
    let closestStation = null;
    let minDistance = Infinity;

    allStations.forEach(st => {
      if ((st.status || "").toUpperCase() !== "ACTIVE") return;
      const dist = calculateDistanceKm(roverLat, roverLng, st.lat, st.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestStation = st;
      }
    });

    if (!closestStation) return;

    // Draw Rover Pin & Baseline Vector
    roverLayer.clearLayers();

    const roverIcon = L.divIcon({
      className: "rover-pin-custom",
      html: `<div style="width: 14px; height: 14px; background: #9D4EDD; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 12px #9D4EDD;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    roverMarker = L.marker([roverLat, roverLng], { icon: roverIcon }).addTo(roverLayer);
    roverMarker.bindPopup(`<strong>Rover Position</strong><br>Lat: ${roverLat.toFixed(5)}°<br>Lng: ${roverLng.toFixed(5)}°`).openPopup();

    baselineLine = L.polyline([[roverLat, roverLng], [closestStation.lat, closestStation.lng]], {
      color: "#9D4EDD",
      weight: 2,
      dashArray: "6, 6",
      opacity: 0.9
    }).addTo(roverLayer);

    // Zoom to fit rover and nearest base station
    map.fitBounds(L.latLngBounds([
      [roverLat, roverLng],
      [closestStation.lat, closestStation.lng]
    ]), { padding: [50, 50], maxZoom: 14 });

    // Output Result Card
    if (baselineResultCard) {
      baselineResultCard.style.display = "block";

      let fixQuality = "";
      let fixColor = "";
      let fixDesc = "";

      if (minDistance <= 15) {
        fixQuality = "Optimal Centimeter RTK Fix (< 1.0 cm)";
        fixColor = "var(--success)";
        fixDesc = "Ultra-short baseline allows near-instant integer ambiguity resolution with survey-grade 1cm accuracy.";
      } else if (minDistance <= 30) {
        fixQuality = "Standard Survey-Grade RTK Fix (1-2 cm)";
        fixColor = "var(--primary)";
        fixDesc = "Excellent multi-frequency RTK baseline. Ideal for GNSS drones, land survey, and precision ag.";
      } else if (minDistance <= 50) {
        fixQuality = "Extended Single-Base / VRS Fix (2-4 cm)";
        fixColor = "var(--warning)";
        fixDesc = "Moderate baseline. RTK convergence may take 30-60s. High precision maintained via triple-frequency receivers.";
      } else {
        fixQuality = "Long Baseline (> 50 km)";
        fixColor = "var(--danger)";
        fixDesc = "Rover is >50km from active CORS base. Recommended to use PPP mode or verify nearby base expansion.";
      }

      baselineResultCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; color: ${fixColor}; font-size: 0.9rem;">${fixQuality}</span>
          <span class="badge badge-live" style="font-size: 0.72rem; padding: 2px 6px;">${minDistance.toFixed(2)} km</span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
          Nearest Base: <strong style="color: var(--primary); font-family: 'JetBrains Mono', monospace;">${closestStation.stationId != null ? '#' + closestStation.stationId + ' ' : ''}(${closestStation.name})</strong> (${closestStation.lat.toFixed(4)}°, ${closestStation.lng.toFixed(4)}°)
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35; margin: 0;">
          ${fixDesc}
        </p>
      `;
    }
  }

  if (roverAnalyzeBtn) {
    roverAnalyzeBtn.addEventListener("click", () => {
      const lat = parseFloat(roverLatInput.value);
      const lng = parseFloat(roverLngInput.value);
      if (!isNaN(lat) && !isNaN(lng)) {
        calculateBaselineForCoords(lat, lng);
      }
    });
  }

  if (roverPickBtn) {
    roverPickBtn.addEventListener("click", () => {
      isPickingRoverLocation = true;
      roverPickBtn.textContent = "Click Map...";
      roverPickBtn.style.borderColor = "var(--primary)";
      mapContainer.style.cursor = "crosshair";
    });
  }

  // Click on map to pick rover location or inspect nearest
  map.on("click", (e) => {
    if (isPickingRoverLocation) {
      isPickingRoverLocation = false;
      roverPickBtn.textContent = "Pick Map";
      roverPickBtn.style.borderColor = "";
      mapContainer.style.cursor = "";

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (roverLatInput) roverLatInput.value = lat.toFixed(5);
      if (roverLngInput) roverLngInput.value = lng.toFixed(5);

      calculateBaselineForCoords(lat, lng);
    }
  });

  // 13. Search Functionality
  async function handleSearch() {
    const query = (searchInput ? searchInput.value : "").trim();
    if (!query) return;

    // 1. Check if query is coordinates "lat, lng"
    const coordParts = query.split(/[\s,]+/);
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      const lat = parseFloat(coordParts[0]);
      const lng = parseFloat(coordParts[1]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        map.flyTo([lat, lng], 10, { duration: 1.2 });
        if (roverLatInput) roverLatInput.value = lat.toFixed(5);
        if (roverLngInput) roverLngInput.value = lng.toFixed(5);
        calculateBaselineForCoords(lat, lng);
        return;
      }
    }

    // 2. Check if query is a stationId (e.g. "3320" or "#3320") or station name (e.g. "CA599" or "****CA599")
    const cleanQuery = query.replace(/[\*#\s]/g, "").toUpperCase();
    const matchingStation = allStations.find(s => {
      if (s.stationId != null && String(s.stationId) === cleanQuery) return true;
      return s.name && s.name.replace(/\*/g, "").toUpperCase().includes(cleanQuery);
    });

    if (matchingStation) {
      map.flyTo([matchingStation.lat, matchingStation.lng], 13, { duration: 1.2 });
      inspectStation(matchingStation);
      return;
    }

    // 3. Geocode city / country name via Nominatim
    try {
      if (searchBtn) searchBtn.textContent = "...";
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.flyTo([lat, lon], 9, { duration: 1.2 });

        if (roverLatInput) roverLatInput.value = lat.toFixed(5);
        if (roverLngInput) roverLngInput.value = lon.toFixed(5);
        calculateBaselineForCoords(lat, lon);
      } else {
        alert(`No location or station found for "${query}"`);
      }
    } catch (e) {
      console.warn("Geocoding failed:", e);
    } finally {
      if (searchBtn) searchBtn.textContent = "Find";
    }
  }

  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
  }

  // 14. Locate My Position
  if (locateBtn) {
    locateBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      locateBtn.innerHTML = "...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locateBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/></svg>`;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.flyTo([lat, lng], 10, { duration: 1.2 });
          if (roverLatInput) roverLatInput.value = lat.toFixed(5);
          if (roverLngInput) roverLngInput.value = lng.toFixed(5);
          calculateBaselineForCoords(lat, lng);
        },
        (err) => {
          locateBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/></svg>`;
          alert("Unable to retrieve your location: " + err.message);
        }
      );
    });
  }

  // 15. Region Jump Presets
  const regionPresets = {
    "global": { center: [25, 10], zoom: 2 },
    "north-america": { center: [39.8, -98.5], zoom: 4 },
    "europe": { center: [50.0, 10.0], zoom: 4 },
    "asia": { center: [25.0, 105.0], zoom: 4 },
    "south-america": { center: [-15.0, -60.0], zoom: 4 },
    "australia": { center: [-26.0, 134.0], zoom: 4 },
    "middle-east": { center: [26.0, 48.0], zoom: 5 },
    "africa": { center: [2.0, 22.0], zoom: 4 }
  };

  regionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      regionBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const regionKey = btn.getAttribute("data-region");
      if (regionPresets[regionKey]) {
        const { center, zoom } = regionPresets[regionKey];
        map.flyTo(center, zoom, { duration: 1.2 });
      }
    });
  });

  // 16. Filter & Delaunay Toggle Listeners
  if (statusFilterSelect) statusFilterSelect.addEventListener("change", renderStations);
  if (delaunayToggleSelect) delaunayToggleSelect.addEventListener("change", renderDelaunayMesh);
  if (edgeDistToggleSelect) edgeDistToggleSelect.addEventListener("change", updateEdgeDistanceLabels);
  if (rangeToggleSelect) rangeToggleSelect.addEventListener("change", renderStations);

  // 17. Refresh Button
  if (refreshBtn) refreshBtn.addEventListener("click", fetchStationData);

  // Initial Fetch
  fetchStationData();
}

