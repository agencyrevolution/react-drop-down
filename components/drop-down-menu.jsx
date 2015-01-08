var React = require('react'),
  mui = require('material-ui'),
  Classable = mui.Mixins.Classable,
  ClickAwayable = mui.Mixins.ClickAwayable,
  KeyLine = mui.Utils.KeyLine,
  Paper = mui.Paper,
  Icon = mui.Icon,
  Menu = require('./menu.jsx');

var DropDownMenu = React.createClass({

  mixins: [Classable, ClickAwayable],

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
      selectedIndex: this.props.selectedIndex,
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
    this.setState(
        {
          selectedIndex: nextProps.selectedIndex, 
          menuItems: nextProps.menuItems,
          open: false
        });
  },

  render: function() {
    var classes = this.getClasses('mui-drop-down-menu', {
      'mui-open': this.state.open
    });

    var chooseText = 'Choose';
    if (this.state.selectedIndex || this.state.selectedIndex === 0 && this.props.menuItems[this.state.selectedIndex] ){
      chooseText =  this.props.menuItems[this.state.selectedIndex].text
    }

    return (
      <div className={classes}>
        <div className="mui-menu-control" onClick={this._onControlClick}>
          <Paper className="mui-menu-control-bg" zDepth={0} />
          <div className="mui-menu-label">
            {chooseText}
          </div>
          <Icon className="mui-menu-drop-down-icon" icon="navigation-arrow-drop-down" />
          <div className="mui-menu-control-underline" />
        </div>
        <Menu
          ref="menuItems"
          autoWidth={this.props.autoWidth}
          selectedIndex={this.state.selectedIndex}
          menuItems={this.props.menuItems}
          hideable={true}
          visible={this.state.open}
          onItemClick={this._onMenuItemClick}
          enableCustomValue={this.props.enableCustomValue} 
          enableFilter = {this.props.enableFilter}
          onCreateNewValue = {this._onCreateNewValue}
          fixScroll = {this.props.fixScroll} />
      </div>
    );
  },


  _onCreateNewValue: function(value) {
    this.state.menuItems.push(value);
    this.state.selectedIndex = this.state.menuItems.length - 1;
    this.state.open = false;
    this.setState(this.state);
    if (this.props.onCreateNewValue)
      this.props.onCreateNewValue(value);
  },

  _setWidth: function() {
    var el = this.getDOMNode(),
      menuItemsDom = this.refs.menuItems.getDOMNode();

    el.style.width = menuItemsDom.offsetWidth + 'px';
  },

  _onControlClick: function(e) {
    this.setState({ open: !this.state.open });
  },

  _onMenuItemClick: function(e, key, payload) {
    if (this.props.onChange && this.state.selectedIndex !== key) this.props.onChange(e, key, payload);
    this.setState({
      selectedIndex: key,
      open: false
    });
  }

});

module.exports = DropDownMenu;