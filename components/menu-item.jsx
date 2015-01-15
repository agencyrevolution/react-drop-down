var React = require('react'),
  mui = require('material-ui'),
  Classable = mui.Mixins.Classable,
  Icon = mui.Icon,
  Toggle = mui.Toggle,
  Ripple = require('./ripple.jsx'),
  Types = {
    LINK: 'LINK',
    SUBHEADER: 'SUBHEADER',
    NESTED: 'NESTED'
  };

var MenuItem = React.createClass({

  mixins: [Classable],

  propTypes: {
    index: React.PropTypes.number.isRequired,
    icon: React.PropTypes.string,
    iconRight: React.PropTypes.string,
    attribute: React.PropTypes.string,
    number: React.PropTypes.string,
    data: React.PropTypes.string,
    toggle: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onToggle: React.PropTypes.func,
    selected: React.PropTypes.bool,
    isHide: React.PropTypes.bool
  },

  statics: {
    Types: Types
  },

  getDefaultProps: function() {
    return {
      toggle: false
    };
  },

  getInitialState: function() {
    return {
      selected: false 
    };
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('Menu-item.componentWillReceiveProps()', nextProps);
    this.setState({selected: this.props.selected});
  },

  render: function() {
    var showStyle = (this.props.isHide) ? {display: 'none'} : {};
    var classes = this.getClasses('mui-menu-item', {
        'mui-selected': this.state.selected
      }),
      icon,
      data,
      iconRight,
      attribute,
      number,
      toggle;

    if (this.props.icon) icon = <Icon className="mui-menu-item-icon" icon={this.props.icon} />;
    if (this.props.data) data = <span className="mui-menu-item-data">{this.props.data}</span>;
    if (this.props.iconRight) iconRight = <Icon className="mui-menu-item-icon-right" icon={this.props.iconRight} />;
    if (this.props.number !== undefined) number = <span className="mui-menu-item-number">{this.props.number}</span>;
    if (this.props.attribute !== undefined) attribute = <span className="mui-menu-item-attribute">{this.props.attribute}</span>;
    if (this.props.toggle) toggle = <Toggle onToggle={this._onToggleClick} />;

    return (
      <div style={showStyle} key={this.props.index} className={classes} onMouseDown={this._onClick}>
        <Ripple ref="ripple" />
        {icon}
        {this.props.children}
        {data}
        {attribute}
        {number}
        {toggle}
        {iconRight}
      </div>
    );
  },

  _onClick: function(e) {
    var _this = this;

    //animate the ripple
    // this.refs.ripple.animate(e, function() {
      if (_this.props.onClick) _this.props.onClick(e, _this.props.index);
    // });
  },

  _onToggleClick: function(e, toggled) {
    if (this.props.onToggle) this.props.onToggle(e, this.props.index, toggled);
  }

});

module.exports = MenuItem;
