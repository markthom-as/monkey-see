var Navbar = ReactBootstrap.Navbar;
var NavItem = ReactBootstrap.NavItem;
var MenuItem = ReactBootstrap.MenuItem;
var Nav = ReactBootstrap.Nav;
var DropdownButton = ReactBootstrap.DropdownButton;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var MyNav = React.createClass({
  render: function() {
    return (  
        <Navbar brand='Monkey See' className="navbar-static-top fluid" toggleNavKey={0}>
          <Nav right eventKey={0}> {/* This is the eventKey referenced */}
            <NavItem eventKey={1} href='http://markthom.as'>My Site</NavItem>
            <NavItem eventKey={2} href='https://github.com/mmarcant'>My Git</NavItem>
          </Nav>
        </Navbar>
    )
  }
});

var TrainerForm = React.createClass({
  getInitialState: function(){
    return {query: '', className: '', size: 3};
  },
  train: function() {
    makeBatch(this.state.query, this.state.className, true, this.state.size, this.props.updateCode);
  },
  handleChange: function(event) {
    switch(event.target) {
      case this.refs.query.getInputDOMNode():
        this.setState({query: event.target.value})
        break;
      case this.refs.className.getInputDOMNode():
        this.setState({className: event.target.value})
        break;
      case this.refs.size.getInputDOMNode():
        this.setState({size: event.target.value})
        break;
    }
    this.setState({value: this.state.value + event.target.value });
  },
  render: function() {
    return (
      <div className="container well">
        <h3>Enter Training Parameters:</h3>
        <form className="form-horizontal">
          <Input type='text' ref='query' onChange={this.handleChange} value={this.state.query} label="Image Query" labelClassName="col-xs-2" wrapperClassName='col-xs-10' />
          <Input type='text' ref='className' onChange={this.handleChange} value={this.state.className} label="Training Class" labelClassName="col-xs-2" wrapperClassName='col-xs-10'  />
          <Input type='number' ref='size' onChange={this.handleChange} value={this.state.size} label="Training Batch Size" labelClassName="col-xs-2" wrapperClassName='col-xs-10'  />
          <Button  onClick={this.train} className="pull-right" bsStyle="primary">Begin Training</Button>
        </form>
      </div>
      

      );
  }
});

var ImgPreview = React.createClass({
  render: function() {
    return (
      <div className="container well" id="images">
        <h4>Trained Images: </h4>
        <img src={this.props.imgSrc} id="current" className="img-responsive center-block" />
      </div>
      );
  }
})

var NetCode = React.createClass({
  getInitialState: function(){
    return {code: getJSON()};
  },
  render: function() {
    return (
      <div className="container well">
        <h4>Neural Network JSON:</h4>
        <Input type="textarea" value={this.state.code} id="code" readOnly={true} />
        <span className="text-muted pull-left">Queries: {BATCH_QUERIES.toString()} <br /> Classes: {BATCH_CLASSES.toString()} <br /> Batches: {BATCH_COUNTER} <br /> Total Images Trained: {IMAGE_COUNTER}</span>
        <span className="text-muted pull-right"> Ctrl-A + Ctrl-C To Copy </span>
      </div>
      );
  }
});

var CheckImage = React.createClass({
  getInitialState: function() {
    return {testImg: '', results: ''}
  },
  handleChange: function(event) {
    this.setState({testImg: event.target.value})
  },
  check: function() {
    console.log('checking test image...', this.state.testImg);
    this.setState({results: checkImg(this.state.testImg)});
  },
  render: function() {
    return (
        <div className="container well">
          <h4>Test Image Recognition:</h4>
          <Input type='text' ref='check' onChange={this.handleChange} value={this.state.testImg} label="Test Image URL" labelClassName="col-xs-2" wrapperClassName='col-xs-10' />
          <br /> <br /> <br />
          <Button  onClick={this.check} className="pull-right" bsStyle="primary">Test Network</Button>
          <span className="text-muted pull-left">Results: {this.state.results.toString()} </span>  
        </div>

      );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {src: '', code: getJSON()};
  },
  changeImg: function(url) {
    this.setState({src: url});
  },
  updateJSON: function() {
    console.log('updating json...')
    this.setState({code: getJSON()});
  },
  render: function() {
    return (
      <div id="main"> 
        <MyNav /> 
        <div id="app">
          <TrainerForm updateCode={this.updateJSON} />
          <ImgPreview  ref="imgPreview" imgSrc={this.state.src}  />
          <CheckImage />
          <NetCode ref="netCode" />
        </div>
      </div>
      )
  }
});

React.render(<App />, document.body);