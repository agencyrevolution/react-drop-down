var React = require('react'),
  mui = require('material-ui'),
  CssEvent = mui.Utils.CssEvent,
  Dom = mui.Utils.Dom,
  KeyLine = mui.Utils.KeyLine,
  Classable = mui.Mixins.Classable,
  ClickAwayable = mui.Mixins.ClickAwayable,
  Paper = mui.Paper,
  MenuItem = require('./menu-item.jsx'),
  Dialog = mui.Dialog,
  Input = mui.Input;
/***********************
 * Nested Menu Component
 ***********************/
var NestedMenuItem = React.createClass({

  mixins: [Classable, ClickAwayable],

  propTypes: {
    index: React.PropTypes.number.isRequired,
    text: React.PropTypes.string,
    menuItems: React.PropTypes.array.isRequired,
    zDepth: React.PropTypes.number,
    onItemClick: React.PropTypes.func
  },

  getInitialState: function() {
    return { open: false }
  },

  componentClickAway: function() {
    this.setState({ open: false });
  },

  componentDidMount: function() {
    this._positionNestedMenu();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this._positionNestedMenu();
  },

  render: function() {
    var classes = this.getClasses('mui-nested-menu-item', {
      'mui-open': this.state.open
    });

    return (
      <div className={classes}>
        <MenuItem index={this.props.index} iconRight="mui-icon-arrow-drop-right" onClick={this._onParentItemClick}>
          {this.props.text}
        </MenuItem>
        <Menu
          ref="nestedMenu"
          menuItems={this.props.menuItems}
          onItemClick={this._onMenuItemClick}
          hideable={true}
          visible={this.state.open}
          zDepth={this.props.zDepth + 1} />
      </div>
    );
  },

  _positionNestedMenu: function() {
    var el = this.getDOMNode(),
      nestedMenu = this.refs.nestedMenu.getDOMNode();

    nestedMenu.style.left = el.offsetWidth + 'px';
  },

  _onParentItemClick: function() {
    this.setState({ open: !this.state.open });
  },

  _onMenuItemClick: function(e, index, menuItem) {
    this.setState({ open: false });
    if (this.props.onItemClick) this.props.onItemClick(e, index, menuItem);
  }

});

/****************
 * Menu Component
 ****************/
var Menu = React.createClass({

  mixins: [Classable],

  propTypes: {
    autoWidth: React.PropTypes.bool,
    onItemClick: React.PropTypes.func,
    onToggleClick: React.PropTypes.func,
    menuItems: React.PropTypes.array.isRequired,
    selectedIndex: React.PropTypes.number,
    hideable: React.PropTypes.bool,
    visible: React.PropTypes.bool,
    zDepth: React.PropTypes.number,
    enableCustomValue: React.PropTypes.bool,
    enableFilter: React.PropTypes.bool,
    fixScroll: React.PropTypes.bool,
    onCreateNewValue: React.PropTypes.func
  },

  getInitialState: function() {
    return { 
      nestedMenuShown: false,
      menuItems: this.props.menuItems 
    }
  },

  getDefaultProps: function() {
    return {
      autoWidth: true,
      hideable: false,
      visible: true,
      zDepth: 1,
      enableCustomValue: false,
      enableFilter: false,
      fixScroll: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.selectedIndex = nextProps.selectedIndex;
    this.setState({menuItems: nextProps.menuItems, selectedIndex: nextProps.selectedIndex});
    if (this.props.enableFilter){
      this.refs.searchBox.setValue('');  
    }
    this._resetMenuItems();
  },

  componentDidMount: function() {
    var el = this.getDOMNode();

    //Set the menu with
    this._setKeyWidth(el);

    //Save the initial menu height for later
    this._initialMenuHeight = el.offsetHeight + KeyLine.Desktop.GUTTER_LESS;

    //Show or Hide the menu according to visibility
    this._renderVisibility();

    //this.refs.dialogTest.show();
  },

  componentWillUpdate: function(prevProps, prevState) {
    if (this.props.visible !== prevProps.visible) {
      this._resetMenuItems();
      if (this.props.enableFilter){
        this.refs.searchBox.setValue('');  
      }
    }
    this._renderVisibility();
  },

  componentDidUpdate: function(prevProps, prevState) {
    var menuItemNode = this.refs.menuItems.getDOMNode();
    menuItemNode.scrollTop = KeyLine.Desktop.MENU_ITEM_HEIGHT * (this.selectedIndex - 1)  ;
  },

  render: function() {
    var classes = this.getClasses('mui-menu', {
      'mui-menu-hideable': this.props.hideable,
      'mui-visible': this.props.visible
    });

    var dialogActions = [
      { text: 'CANCEL' },
      { text: 'SUBMIT', onClick: this._onDialogSubmit }
    ];

    return (
      <Paper ref="paperContainer" zDepth={this.props.zDepth} className={classes}>
        {this._renderInput()}
        <div style={{height: this.childrenHeight, overflow: 'scroll'}} ref="menuItems">
          {this._getChildren()}
        </div>
        {this._renderDialog(this.state.searchValue)}
      </Paper>
    );
  },

  _renderInput: function() {
    if (this.props.enableFilter){
        return (
          <Input placeholder="Search here" name="searchBox" ref="searchBox" onChange={this._onSearchValueChange}/>
        )
    }
  },

  _onSearchValueChange: function(e, value) {
    // console.log('onSearchValueChange(e, value)', value);
    
    var items = this.state.menuItems.map(function(item) {
      if(item.text.toLowerCase().indexOf(value.toLowerCase()) === -1) {
        item.isHide = true;
      } else item.isHide = false;
      return item;
    });

    this.refs.customValueInput.setValue(value);
    this.setState({menuItems: items, searchValue: value});

  },
  _getVisibleMenuItemsLength: function() {
    var items = this.state.menuItems.filter(function(item) {
      return !item.isHide;
    });

    return items.length;
  },

  _resetMenuItems: function() {
    items = this.props.menuItems.map(function(item) {
      item.isHide = false;
      return item;
    });
    this.setState({menuItems: items});
  },

  _onCustomValueDialogSubmit: function() {
    this.refs.customValueDialog.dismiss();

    
    var value = {
      payload: this.refs.customValueInput.getValue(),
      text: this.refs.customValueInput.getValue(),
      isHide: false
    };

    if (this.props.onCreateNewValue) {
      this.props.onCreateNewValue(value);  
    }
  },


  _renderDialog: function(value) {
    var dialogActions = [
      { text: 'CANCEL' },
      { text: 'SUBMIT', onClick: this._onCustomValueDialogSubmit}
    ];


    return (
      <Dialog actions={dialogActions} ref="customValueDialog">
        <Input name="customValue" ref="customValueInput" defaultValue={value} placeholder="Value" />
      </Dialog>
    )
  },

  _getChildren: function() {
    var children = [],
      menuItem,
      itemComponent,
      searchInputStyle,
      isSelected;

    //This array is used to keep track of all nested menu refs
    this._nestedChildren = [];
    //This array is used to keep track of all nested menu refs
    for (var i=0; i < this.props.menuItems.length; i++) {
      menuItem = this.props.menuItems[i];
      isSelected = i === this.props.selectedIndex;

      switch (menuItem.type) {

        case MenuItem.Types.LINK:
          itemComponent = (
            <a key={i} index={i} className="mui-menu-item" href={menuItem.payload}>{menuItem.text}</a>
          );
        break;

        case MenuItem.Types.SUBHEADER:
          itemComponent = (
            <div key={i} index={i} className="mui-subheader">{menuItem.text}</div>
          );
          break;

        case MenuItem.Types.NESTED:
          itemComponent = (
            <NestedMenuItem
              ref={i}
              key={i}
              index={i}
              text={menuItem.text}
              menuItems={menuItem.items}
              zDepth={this.props.zDepth}
              onItemClick={this._onNestedItemClick} />
          );
          this._nestedChildren.push(i);
          break;

        default:
          itemComponent = (
            <MenuItem
              selected={isSelected}
              isHide = {menuItem.isHide}
              key={i}
              index={i}
              icon={menuItem.icon}
              data={menuItem.data}
              attribute={menuItem.attribute}
              number={menuItem.number}
              toggle={menuItem.toggle}
              onClick={this._onItemClick}
              onToggle={this._onItemToggle}>
              {menuItem.text}
            </MenuItem>
          );
      }

      children.push(itemComponent);
    }

    if (this._getVisibleMenuItemsLength()=== 0) {
      if (this.props.enableCustomValue) {
        children.push(
          <div onClick={this._showDialog}>No result: add custom value </div>
        );
      } else {
        children.push(
          <div>No results found</div>
        );
      }
    }

    return children;
  },


  _showDialog: function() {
    this.refs.customValueDialog.show();
  },

  _setKeyWidth: function(el) {
    var menuWidth = this.props.autoWidth ?
      KeyLine.getIncrementalDim(el.offsetWidth) + 'px' :
      '100%';

    //Update the menu width
    Dom.withoutTransition(el, function() {
      el.style.width = menuWidth;
    });
  },

  _getMenuHeight: function(el) {

    var h = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    return h - el.getBoundingClientRect().top - 20;
  },

  _getMenuResultHeight: function(el) {
    var menuHeight = this._getMenuHeight(el);
    if (this.props.enableFilter){
      menuHeight -= 120;
    }
    this._initialMenuHeight = (KeyLine.Desktop.MENU_ITEM_HEIGHT) * (this._getVisibleMenuItemsLength() + 1);

    //Open the menu
    if (this.props.fixScroll) {
       return Math.min(this._initialMenuHeight, menuHeight);
    } else {
      return this._initialMenuHeight;
    }
  },

  _renderVisibility: function() {
    var el;

    if (this.props.hideable) {
      el = this.getDOMNode();
      var innerContainer = this.refs.paperContainer.getInnerContainer().getDOMNode();
      
      if (this.props.visible) {
        this.childrenHeight = this._getMenuResultHeight(el);
        // menuItemNode.scrollTo(0,200);
        // this.setState(this.state);
        // if (this.props.enableFilter)
        //   this._initialMenuHeight = (KeyLine.Desktop.MENU_ITEM_HEIGHT) * (this._getVisibleMenuItemsLength() + 1) + 118;
         
        // //Open the menu
        // if (this.props.fixScroll) {
        //    el.style.height = Math.min(this._initialMenuHeight, this._getMenuHeight(el)) + 'px';
        // } else {
        //   el.style.height = this._initialMenuHeight + 'px';
        // }
        el.style.height = 'initial';
        //Set the overflow to visible after the animation is done so
        //that other nested menus can be shown
        CssEvent.onTransitionEnd(el, function() {
          //Make sure the menu is open before setting the overflow.
          //This is to accout for fast clicks
          // if (this.props.fixScroll) {
          //   if (this.props.visible) innerContainer.style.overflow = 'scroll'; 
          // } else {
          //   if (this.props.visible) innerContainer.style.overflow = 'visible'; 
          // }
          if (this.props.visible) innerContainer.style.overflow = 'visible'; 
        }.bind(this));

      } else {

        //Close the menu
        el.style.height = '0px';

        //Set the overflow to hidden so that animation works properly
        innerContainer.style.overflow = 'hidden';
      }
    }
  },

  _onNestedItemClick: function(e, index, menuItem) {
    if (this.props.onItemClick) this.props.onItemClick(e, index, menuItem);
  },

  _onItemClick: function(e, index) {
    if (this.props.onItemClick) this.props.onItemClick(e, index, this.props.menuItems[index]);

    this.selectedIndex = index;
  },

  _onItemToggle: function(e, index, toggled) {
    if (this.props.onItemToggle) this.props.onItemToggle(e, index, this.props.menuItems[index], toggled);
  }

});

module.exports = Menu;