//express.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
const models = require("./models");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
// 다른 파일이 오면 어디로 저장할거니

app.use(express.json()); //json 형식의 데이터를 처리할 수 있게 설정하는 코드
app.use(cors()); //브라우저의 CORS 이슈를 막기 위해 사용하는 코드
app.use("/uploads", express.static("uploads"));
// 이 코드는 실제 파일의 경로와 클라이언트가 접근하는 경로를 매핑하는 역할을 합니다. 간단하게 말해, 클라이언트가 /uploads 경로로 파일에 접근할 수 있게 만드는 것입니다.
// express.static("uploads"): uploads 폴더를 정적 파일을 제공하는 경로로 설정합니다. 클라이언트가 이 폴더의 파일에 접근할 수 있게 됩니다.
// app.use("/uploads", ...): 클라이언트가 /uploads 경로로 요청을 보낼 때 uploads 폴더의 파일들을 제공하도록 설정합니다.
// 즉, 서버에 있는 파일들을 클라이언트가 접근할 수 있게 하려면 실제 경로 대신 원하는 URL 경로를 사용할 수 있게 해줍니다.
// 예를 들어, uploads/image.png 파일을 브라우저에서 http://localhost:8080/uploads/image.png로 접근할 수 있게 되는 것이죠.

// app.get("/", function (req, res) {
//   res.send("Hello World");
// });

app.get("/banners", (req, res) => {
  models.Banner.findAll({
    limit: 2,
  })
    .then((result) => {
      res.send({
        banners: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다");
    });
});

app.get("/products", async (req, res) => {
  // 메서드가 get인 products 경로로 요청이 왔을 때
  // async는 함수의 앞에 붙여서 해당 함수가 비동기 함수임을 나타내며, await는 비동기 함수의 실행 결과를 기다리는 키워드이다.
  models.Product.findAll({
    // sql문 들어가네
    // limit: n
    order: [["createdAt", "DESC"]],
    // 등록시간기준 내림차순
    attributes: [
      "id",
      "name",
      "price",
      "createdAt",
      "seller",
      "imageUrl",
      "soldout",
    ],
    // 어떤 컬럼(카테고리)을 가져올 것이냐
    // 이거는 메인화면에 들어가는거라 description이 필요없음 그래서 밑에 app.get이 또있는게 로직을 나눠준 것
  })
    .then(
      //해당 프로덕트 테이블에 있는 모든 데이터를 가져온다.
      (result) => {
        console.log("PRODUCTS : ", result);
        res.send({
          products: result,
        });
      }
    )
    .catch((error) => {
      console.error(error);
      res.status(400).send("에러 발생");
    });
});

app.post("/products", async (req, res) => {
  // 메서드가 post인 products 경로로 요청이 왔을 때
  // header의 content-type은 application/json
  // node.js로 만들었을때는  res.writeHead(200, { "Content-Type": "application/json" });
  // 이렇게 명시했는데 express는 안그래도 되는듯?
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !price || !seller || !description || !imageUrl) {
    res.status(400).send("모든 필드를 입력해주세요");
    //방어코드
  }
  models.Product.create({
    name,
    description,
    price,
    seller,
    imageUrl,
  })
    .then((result) => {
      console.log("상품 생성 결과 : ", result);
      res.send({
        result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("상품 업로드에 문제가 발생했습니다.");
    });
});

app.get("/products/:id", (req, res) => {
  const params = req.params; //{id : 값} 형태로 들어옵니다.
  const { id } = params; //ES6 Destructuring
  models.Product.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT : ", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("상품 조회에 에러가 발생했습니다.");
    });
});

// 이미지 파일 하나만 보낼때 사용되는 구문 single
// image 라는 이름의 파일이 들어왔을때 사용됨, 파일을 보낼때는 항상 키가 있어야 한다.
// 데이터 요청이 왔을떄 upload.single을 거쳐서 upload폴더에 저장
// postman body탭의 form-data 선택후 키값 입력

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

app.post("/purchase/:id", (req, res) => {
  const { id } = req.params;
  models.Product.update(
    {
      soldout: 1,
      // true
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다.");
    });
});

//세팅한 app을 실행시킨다.
app.listen(port, () => {
  console.log("그랩 마켓의 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync() // 모델스 폴더의 인덱스에 테이블과 관련된 정보를 넣을건데 그거와 싱크를 하겠다는 함수
    .then(() => {
      console.log("✓ DB 연결 성공");
    })
    .catch((err) => {
      console.error(err);
      console.log("✗ DB 연결 에러");
      process.exit();
    });
});
