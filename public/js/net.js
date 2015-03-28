
//Image Variables 
var IMG_WIDTH = 100;
var IMG_HEIGHT = 100;
var DEPTH = 3;

//Set Variables
var NUM_CLASSES = 0; //Number of materials
var BATCH_SIZE = 0; //number of items in training batch
var BATCH_QUERIES = [];
var BATCH_CLASSES = [];
var BATCH_COUNTER = 0;
var IMAGE_COUNTER = 0;
var CURRENT_URL = '';

//Neural Network Layer Definitions
var layer_defs = [];
layer_defs.push({type:'input', out_sx: 100, out_sy:100, out_depth: 3}); // Declare size of input image
layer_defs.push({type:'conv', sx:10, filters: 16, stride: 1, pad: 2, activation:'relu'});
layer_defs.push({type:'pool', sx: 2, stride: 2});
layer_defs.push({type:'conv', sx: 2, filters: 20, stride: 1, pad: 2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'softmax', num_classes:BATCH_CLASSES.length});

//creates network
var net = new convnetjs.Net();
net.makeLayers(layer_defs);


//returns stringified json object
var getJSON = function(){
  //hack to get JSON.stringify back
  JSON.stringify = (function() {
    var e = document.createElement('frame');
    e.style.display = 'none';
    var f = document.body.appendChild(e);
    return f.contentWindow.JSON.stringify;
  })();
  
  return JSON.stringify(net.toJSON(), null, 2);
}

//creates network trainer
var trainer = new convnetjs.SGDTrainer(net, {method:'adadelta', batch_size: BATCH_SIZE, l2_decay:0.0001});

//takes an image element and converts to ConvNet Vol object
var makeVol = function(url) {
      var img_el = document.createElement('img'); //creates dom element
      img_el.src = url; //sets the img src to the passed in image url
      img_el.crossOrigin = "https://api.flickr.com/crossdomain.xml";
      img_el.width = IMG_WIDTH;
      img_el.height = IMG_HEIGHT;
      var vol = convnetjs.img_to_vol(img_el);
      for(var i = 0; i < BATCH_CLASSES.length; i++){
        vol.w[i] = BATCH_CLASSES[i];
      }
      return vol; //converts image element into vol  return vol;
};

//checks an image against the neural network and returns a probability of the classes 
var checkImg = function(url) {
  var results = [];
  var scores = net.forward(makeVol(url));
  for(var i=0; i<scores.w.length; i++){
    results.push(BATCH_CLASSES[i] + ': ' + scores.w[i])
  }
  return results.toString();
};

//takes a batch array of image objects with a url and label field and trains the network
var train = function(batch, size) {
  if(size !== undefined){
    BATCH_SIZE = size;
  }
  batch.forEach(function(image){
    var vol = makeVol(image.url);
    console.log('Training: '+image.className+", for query: "+image.query+" on url: "+image.url);
    trainer.train(vol, image.className);
  })
};

var flickr = new Flickr({api_key: "92bba87c8581878bc0b4543ed6dfbaad"});

//pulls in photos from flickr api and can train automatically
var makeBatch = function(query, className, trainNow, size, cb){
  BATCH_QUERIES.push(query);
  BATCH_CLASSES.push(className);
  BATCH_COUNTER++;

  //update layer defs and re-layer network
  layer_defs[layer_defs.length-1].num_classes = BATCH_CLASSES.length;
  net.makeLayers(layer_defs);
  NUM_CLASSES = BATCH_CLASSES.length;
  BATCH_SIZE = size;
  IMAGE_COUNTER += size;
  size = size || 25;
  var batch = [];
  flickr.photos.search({
    content_type: 1, //sets as photos only
    text: query,
    page: Math.floor(Math.random * 10),
    privacy_filter: 1,
    per_page: size,
    sort: 'relevance'
  }, function(err, results){
    if(err){
      console.log(err);
    }else{
      results.photos.photo.forEach(function(photo){
        var photo_obj = {url: 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg', query: query, className: className};
        var img = document.createElement("img");
        img.crossOrigin = 'anonymous';
        img.src = photo_obj.url;
        document.getElementById('images').appendChild(img);
        img.addEventListener("load", function(){
          var imgCanvas = document.createElement("canvas");
          var imgContext = imgCanvas.getContext("2d");
          imgCanvas.width = img.width;
          imgCanvas.height = img.height;
          imgContext.drawImage(img, 0, 0, img.width, img.height);

          photo_obj.url = imgCanvas.toDataURL("img/jpg");
          batch.push(photo_obj);
          if(batch.length === size && trainNow){
            train(batch, size);
            cb();
          }
        }, false);
      });
    }

  });    
}