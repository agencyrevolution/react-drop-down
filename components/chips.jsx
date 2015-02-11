var React = require('react'),
  update = React.addons.update,
  PureRenderMixin = React.addons.PureRenderMixin,
  _ = require('lodash'),
  mui = require('material-ui'),
  Classable = mui.Mixins.Classable,
  ClickAwayable = mui.Mixins.ClickAwayable,
  KeyLine = mui.Utils.KeyLine,
  Paper = mui.Paper,
  Icon = mui.Icon,
  Menu = require('./menu.jsx');

var DropDownMenu = React.createClass({

  mixins: [Classable, ClickAwayable, PureRenderMixin],

  propTypes: {
    autoWidth: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    menuItems: React.PropTypes.array.isRequired,
    enableFilter: React.PropTypes.bool,
    enableCustomValue: React.PropTypes.bool,
    fixScroll: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      autoWidth: true,
      fixScroll: false,
      enableCustomValue: false,
      enableFilter: false
    };
  },

  getInitialState: function() {
    return {
      open: false,
      selectedIndexs: this.props.selectedIndexs || [],
      menuItems: this.props.menuItems
    }
  },

  componentClickAway: function() {
    this.setState({ open: false });
  },

  componentDidMount: function() {
    if (this.props.autoWidth) this._setWidth();
    this.setState({menuItems: this.props.menuItems});
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.hasOwnProperty('selectedIndexs')){
      this.setState(
        {
          selectedIndexs: nextProps.selectedIndexs, 
          menuItems: nextProps.menuItems,
          open: false
        });
    } else {
      this.setState(
        {
          menuItems: nextProps.menuItems,
          open: false
        });
    }
  },

  render: function() {
    var self = this;
    var classes = this.getClasses('mui-drop-down-menu', {
      'mui-open': this.state.open
    });

    var chooseText = [];

    if (this.state.selectedIndexs.length > 0) {
      _.forEach(this.state.selectedIndexs, function(index) {
        if (index > -1) {
          chooseText.push(
            self.renderSelectedItem(self.props.menuItems[index].text)
          )
        }
      });    
    }

    var labelStyle = {
      position: 'absolute',
      marginTop: -50
    };
    return (
      <div className={classes}>
        <div className="mui-menu-control" onClick={this._onControlClick}>
          <Paper className="mui-menu-control-bg" zDepth={0} />
          <div style={labelStyle}>
            {chooseText}
          </div>
          <Icon className="mui-menu-drop-down-icon" icon="navigation-arrow-drop-down" />
          <div className="mui-menu-control-underline" />
        </div>
        <Menu
          ref="menuItems"
          autoWidth={this.props.autoWidth}
          selectedIndexs={this.state.selectedIndexs}
          menuItems={this.props.menuItems}
          hideable={true}
          visible={this.state.open}
          onItemClick={this._onMenuItemClick}
          enableCustomValue={this.props.enableCustomValue} 
          enableFilter = {this.props.enableFilter}
          fixScroll = {this.props.fixScroll} />
      </div>
    );
  },

  renderSelectedItem: function(text) {
    var selectedStyle = {
      backgroundColor: '#eee',
      float: 'left',
      border: '1px solid',
      borderRadius: '10px',
      minWidth: '100px',
      textAlign: 'center',
      margin: 5,
      padding: 5
    };

    return (
      <div style={selectedStyle}>
        {text}
      </div>
    )
  },

  _setWidth: function() {
    var el = this.getDOMNode(),
      menuItemsDom = this.refs.menuItems.getDOMNode();

    // el.style.width = menuItemsDom.offsetWidth + 'px';
    el.style.width = '400' + 'px';
  },

  _onControlClick: function(e) {
    this.setState({ open: !this.state.open });
  },

  _onMenuItemClick: function(e, key, payload) {
    if (this.state.selectedIndexs.indexOf(key) > -1) {
      this.state.selectedIndexs = _.reject(this.state.selectedIndexs, function(selected) {
        return selected === key;
      });
      this.setState({
        selectedIndexs: this.state.selectedIndexs,
        open: false
      });
    } else {
      this.state.selectedIndexs.push(key);
      this.setState({
        selectedIndexs: this.state.selectedIndexs,
        open: false
      });
    }
    if (this.props.onChange) this.props.onChange(e, this.state.selectedIndexs);
  }

});

module.exports = DropDownMenu;