
import Box from '@mui/material/Box';
import Immage from '../util/image';
import '../../css/home.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { Button } from '@mui/material';
import Divider from '@mui/material/Divider';
import capture from '../../images/Capture d’écran du 2025-07-31 19-27-23.png';
import { Carousel } from 'primereact/carousel';
import flash from'../../images/flash.png';
import { useNavigate} from 'react-router-dom';
import products from "../shop/products";
import   plant from "../../images/plants .jpg";
import men from "../../images/man.png";
import women from "../../images/woman.png";
import garden from "../../images/gargen.jpg";
import elect from "../../images/elect.jpg";
import pet from "../../images/prt.jpg";
import kid from "../../images/kids.png";
import beau from "../../images/beauty.jpg";
import vd from "../../images/7262257-uhd_3840_2160_25fps.mp4"
 import { ToastContainer, toast } from 'react-toastify';
export default function Content() {
const elements = products.filter(product => product.feature=== "weekly")
const element = products.filter(product => product.feature=== "today")

const categories = [
  { label: "Men's", img: men ,ID:0},
  { label: "Women's", img: women,ID:1},
  { label: "garden", img: garden,ID:2},
  { label: "electronics", img: elect,ID:3 },
  { label: "pet's", img: pet ,ID:4},
  { label: "Kid's", img: kid ,ID:5},
  { label: "beauty's", img: beau,ID:6 }
];
   const navigate = useNavigate();
const goToEditor = (param, type = "genre") => {
  if (type === "genre") {
    navigate(`/category/${encodeURIComponent(param)}`);
  } else {
    navigate(`/feature/${encodeURIComponent(param)}`);
  }
};

const goToEdito = (feature, title) => {
  navigate(`/feature/${encodeURIComponent(feature)}/${encodeURIComponent(title)}`);
};


const responsiveOptions = [
  {
    breakpoint: '102px',
    numVisible: 5,
    numScroll: 1,
  },
  {
    breakpoint: '768px',
    numVisible: 5,
    numScroll: 1,
  },
  {
    breakpoint: '560px',
    numVisible: 5,
    numScroll: 1,
  },
 {
    breakpoint: '960px',
    numVisible: 5,
    numScroll: 1,
  },]
const productTemplate = (item, index) => {
  const price = Number(item.price);
  const hasDiscount = item.discount > 0;
  const finalPrice = hasDiscount
    ? (price - (price * Number(item.discount)) / 100).toFixed(2)
    : price.toFixed(2);

  return (
    <Card
      key={index}
      sx={{ padding: 1, textAlign: "center", cursor: "pointer" }}
      className="colorweek"
      onClick={() => goToEdito(item.feature, item.title)}
    >
      <img
        src={item.image}
        alt={item.title}
        style={{ height: 80, objectFit: "contain", margin: "auto" }}
      />

      <Typography variant="body2" sx={{ mt: 1 }}>
        {item.title}
      </Typography>

      {hasDiscount ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
          {/* Prix barré */}
          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "grey.600" }}
          >
            {price.toFixed(2)} TND
          </Typography>

          {/* Prix réduit */}
          <Typography variant="h6" fontWeight="bold" color="error">
            {finalPrice} TND
          </Typography>

          {/* Pourcentage */}
          <Typography variant="caption" color="success.main">
            -{Number(item.discount)}%
          </Typography>
        </Box>
      ) : (
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
          {finalPrice} TND
        </Typography>
      )}
    </Card>
  );
};


  return (
    <div>
    <Box component="section"  sx={{ border: '1px grey', my:1}}>
      < Immage/>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box component="section" className="carde">
        {categories.map((cat, index) => (
         <Card sx={{ maxWidth: 345 }}    onClick={() => goToEditor(cat.label)} className="cardee">
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={cat.img}
      

        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {cat.label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
    ))}
      </Box>
      <Divider sx={{ my: 1}} />
   <Box className="deals-section">
 <Typography variant="h5">Today's Best Deals 💥</Typography>
<Box className="deals-content">
  {/* Featured card */}
  <Box className="featured-card">
  <Card className="featured-card" onClick={() => goToEdito("today", "Garden Plant")}>
    <Box>
      <Typography variant="h6">Decorative Plant For Home</Typography>
      <Typography sx={{ color: 'red', fontWeight: 'bold', mt: 1 }}>
        Starting From 27.00TND
      </Typography>

      {/* ✅ Button INSIDE Card */}
      <Button 
        variant="contained" 
        size="small" 
        sx={{ mt: 2 }} 
        onClick={(e) => {
          e.stopPropagation(); // ✅ empêche le click de la Card
          navigate("/feature/today");
        }}
      >
        others items
      </Button>

    </Box>
    <img src={plant} alt="plant" style={{ height: 150 }} />
  </Card>
</Box>
  <Box className="side-cards">
    {element
      .filter(item => item.title !== "Garden Plant") 
      .map((item, index) => (
<Card 
  key={index} 
  sx={{ padding: 1, cursor: 'pointer' }}
  onClick={() => goToEdito("today", item.title)}
>          <img src={item.image} alt={item.title} style={{ height: 60, objectFit: 'contain' }} />
          <Typography variant="body2" sx={{ mt: 1 }}>{item.title}</Typography>
        {item.discount > 0 ? (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
    <Typography
      variant="body2"
      sx={{ textDecoration: "line-through", color: "grey.600" }}
    >
      {Number(item.price).toFixed(2)} TND
    </Typography>

    <Typography variant="h6" fontWeight="bold" color="error">
      {(Number(item.price) - (Number(item.price) * Number(item.discount)) / 100).toFixed(2)} TND
    </Typography>

    <Typography variant="body2" color="success.main">
      -{Number(item.discount)}%
    </Typography>
  </Box>
) : (
  <Typography variant="h6" fontWeight="bold">
    {Number(item.price).toFixed(2)} TND
  </Typography>
)}

        </Card>
    ))}
  </Box>
</Box>
</Box>
<Card className="feedback">
      <CardMedia
        component="video"
        controls
        src={vd}
        sx={{ width: 600 }}
        poster={capture}
      />
      <Box className="color">
        <CardContent  >
          <Typography gutterBottom variant="h5" component="div" >
            Our users' feedback
          </Typography>
          <Typography variant="body2" color="text.secondary">
            See what our users think of our platform!
          </Typography>
        </CardContent>
      </Box>
    </Card>
<Box className="image-container">
  <img src={flash} alt="Flash Sale" className="image-container-img" />
</Box>

 <Box className="deals-section">
  <Typography variant="h5">Weekly's Best Deals 💥</Typography>
<Carousel
  value={elements}
  numScroll={1}
  numVisible={5}
  circular
  autoplayInterval={3000} // défilement automatique
  responsiveOptions={responsiveOptions}
  itemTemplate={productTemplate}
  className="trans-carousel"
/>
    </Box>
      </div>
  );}