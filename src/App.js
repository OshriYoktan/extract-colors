import { useState } from 'react';
import './App.css';

function App() {
  const [rgbArray, setRgbArray] = useState([])

  const loadImage = () => {
    const imgFile = document.getElementById("imgfile");
    const image = new Image();
    const file = imgFile.files[0];
    const fileReader = new FileReader();

    fileReader.onload = () => {
      image.onload = () => {
        const canvas = document.getElementById("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rgbData = buildRgb(imageData.data);
        const quantColors = quantization(rgbData, 0);
        console.log(quantColors);
        const splicedColors = quantColors.splice(0 , 5)
        setRgbArray(splicedColors)
        orderByLuminance(splicedColors)
      };
      image.src = fileReader.result;
    };
    fileReader.readAsDataURL(file);
  };

  const orderByLuminance = (rgbValues) => {
    const calculateLuminance = (p) => {
      return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    return rgbValues.sort((p1, p2) => {
      return calculateLuminance(p2) - calculateLuminance(p1);
    });
  };

  const buildRgb = (imageData) => {
    const rgbValues = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const rgb = {
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2],
      };

      rgbValues.push(rgb);
    }
    return rgbValues;
  };

  const findBiggestColorRange = (rgbValues) => {

    let rMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;

    let rMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;

    rgbValues.forEach((pixel) => {
      rMin = Math.min(rMin, pixel.r);
      gMin = Math.min(gMin, pixel.g);
      bMin = Math.min(bMin, pixel.b);

      rMax = Math.max(rMax, pixel.r);
      gMax = Math.max(gMax, pixel.g);
      bMax = Math.max(bMax, pixel.b);
    });

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    const biggestRange = Math.max(rRange, gRange, bRange);
    if (biggestRange === rRange) {
      return "r";
    } else if (biggestRange === gRange) {
      return "g";
    } else {
      return "b";
    }
  };

  const quantization = (rgbValues, depth) => {
    const MAX_DEPTH = 4;
    if (depth === MAX_DEPTH || rgbValues.length === 0) {
      const color = rgbValues.reduce(
        (prev, curr) => {
          prev.r += curr.r;
          prev.g += curr.g;
          prev.b += curr.b;

          return prev;
        },
        {
          r: 0,
          g: 0,
          b: 0,
        }
      );
      color.r = Math.round(color.r / rgbValues.length);
      color.g = Math.round(color.g / rgbValues.length);
      color.b = Math.round(color.b / rgbValues.length);

      return [color];

    }

    const componentToSortBy = findBiggestColorRange(rgbValues);
    rgbValues.sort((p1, p2) => {
      return p1[componentToSortBy] - p2[componentToSortBy];
    });

    const mid = rgbValues.length / 2;
    return [
      ...quantization(rgbValues.slice(0, mid), depth + 1),
      ...quantization(rgbValues.slice(mid + 1), depth + 1),
    ];
  };

  return (
    <div className="App">
      <h1>Color palette creator</h1>
      <form >
        <input type="file" accept="image/gif, image/jpeg, image/png" id="imgfile" />
        <input type="button" id="btnLoad" value="Load" onClick={() => loadImage()} />
      </form>
      <canvas style={{ height: 200, width: 200, objectFit: "contain" }} id="canvas"></canvas>
      <div className="rgb-array">
      {rgbArray.length ? rgbArray.map((rgb,index) => <div className='rgb-item' style={{backgroundColor: `rgb(${rgb.r},${rgb.g},${rgb.b})`}} key={index}> R : {rgb.r} G : {rgb.g} B : {rgb.b}  </div> ) : '' }
        </div>

    </div>
  );
}

export default App;
