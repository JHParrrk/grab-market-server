//index.js
var http = require("http"); // node 내장 모듈 불러옴
var hostname = "127.0.0.1"; // localhost와 동일
var port = 8080;

const server = http.createServer(function (req, res) {
  const path = req.url; //req.url에는 port와 ip번호를 제외한 url이 들어가게 됩니다.
  const method = req.method;
  if (path === "/products") {
    //아티클 정보를 받아오는 요청
    if (req.method === "GET") {
      // 멤버들 정보를 받아오는 요청 객체의 배열을 보내주어야 한다
      // 유형이 get일때
      res.writeHead(200, { "Content-Type": "application/json" });
      // 응답에 대한 header를 작성하는 부분이다. 첫번째 매개변수는 응답코드이며, 두번째 매개변수로는 헤더에 들어갈 내용을 작성해준다.
      // json 형식의 응답을 보낼 것이다 라는 코드
      const products = JSON.stringify([
        //배열형태를 String으로 바꿈
        {
          name: "농구공",
          price: 5000,
        },
      ]);
      res.end(products);
    } else if (method === "POST") {
      // 멤버가 회원가입을 할 때 요청
      // 유형이 post일때
      res.end("생성되었습니다!");
    } else if (url === "/products/1") {
      // 1번째 아티클 상세 정보를 받아오는 요청
    }
    res.end("Good bye");
  }
});

server.listen(port, hostname);

console.log("grab market server on!");
