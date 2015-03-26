//Image Variables 
var IMG_WIDTH = 100;
var IMG_HEIGHT = 100;
var DEPTH = 3;

//Set Variables
var NUM_CLASSES = 0; //Number of materials
var BATCH_SIZE = 0; //number of items in training batch
var BATCH_QUERIES = [];

//Neural Network Layer Definitions
var layer_defs = [];
layer_defs.push({type:'input', out_sx: 100, out_sy:100, out_depth: 3}); // Declare size of input image
layer_defs.push({type:'conv', sx:10, filters: 16, stride: 1, pad: 2, activation:'relu'});
layer_defs.push({type:'pool', sx: 2, stride: 2});
layer_defs.push({type:'conv', sx: 2, filters: 20, stride: 1, pad: 2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'softmax', num_classes:NUM_CLASSES});

//creates network
var net = new convnetjs.Net();
net.makeLayers(layer_defs);

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
      for(var i = 0; i < BATCH_QUERIES.length; i++){
        vol.w[i] = BATCH_QUERIES[i];
      }
      return vol; //converts image element into vol  return vol;
};

//checks an image against the neural network and returns a probability of the classes 
var checkImg = function(url) {
  var scores = net.forward(makeVol(url));
  return scores.w;
};

//takes a batch array of image objects with a url and label field and trains the network
var train = function(batch, size, context) {
  if(size !== undefined){
    BATCH_SIZE = size;
  }
  batch.forEach(function(image){
    if(context !== undefined){
      document.getElementById('current').src = image.url;
      context.current = image.url;
      
    }
    var vol = makeVol(image.url);
    console.log('Training: '+image.className+", for query: "+image.query+" on url: "+image.url);
    trainer.train(vol, image.className);
    context.current = image.url;
    context.$apply();

  })
};

var flickr = new Flickr({api_key: "92bba87c8581878bc0b4543ed6dfbaad"});

//pulls in photos from flickr api and can train automatically
var makeBatch = function(query, className, trainNow, size, context){
  BATCH_QUERIES.push(query);
  NUM_CLASSES = BATCH_QUERIES.length;
  BATCH_SIZE = size;
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
        img.addEventListener("load", function(){
          var imgCanvas = document.createElement("canvas");
          var imgContext = imgCanvas.getContext("2d");
          document.getElementById('current').src = photo_obj.url;
          document.body.appendChild(this);
          imgCanvas.width = img.width;
          imgCanvas.height = img.height;

          imgContext.drawImage(img, 0, 0, img.width, img.height);

          photo_obj.url = imgCanvas.toDataURL("img/jpg");
          batch.push(photo_obj);
          if(batch.length === size && trainNow){
            train(batch, size, context);
          }
        }, false);
      });
    }
  });
}