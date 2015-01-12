var React = require('react'),
  mui = require('material-ui'),
  CssEvent = mui.Utils.CssEvent,
  Dom = mui.Utils.Dom,
  KeyLine = mui.Utils.KeyLine,
  KeyCode = mui.Utils.KeyCode,
  Classable = mui.Mixins.Classable,
  ClickAwayable = mui.Mixins.ClickAwayable,
  WindowListenable = mui.Mixins.WindowListenable,
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

  mixins: [Classable, WindowListenable],

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
      selectedIndex: this.props.selectedIndex,
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
    // this.selectedIndex = nextProps.selectedIndex;
    //console.log('componentWillReceiveProps(nextProps)', nextProps);
    this.setState({selectedIndex: nextProps.selectedIndex});
    // console.log('componentWillReceiveProps(selectedIndex)', this.state.selectedIndex);
    if (this.props.enableFilter){
      this.refs.searchBox.setValue('');  
    }
    this._resetMenuItems();
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    //this.setState({selectedIndex: this.props.selectedIndex});
    //Set the menu with
    this._setKeyWidth(el);

    //Save the initial menu height for later
    this._initialMenuHeight = el.offsetHeight + KeyLine.Desktop.GUTTER_LESS;

    //Show or Hide the menu according to visibility
    this._renderVisibility();

    //this.refs.dialogTest.show();
  },

  componentWillUpdate: function(prevProps, prevState) {
    //console.log('componentWillUpdate()', this.state.selectedIndex);
    if (this.props.visible !== prevProps.visible) {
      this._resetMenuItems();
      if (this.props.enableFilter){
        this.refs.searchBox.setValue('');  
      }
    }
    this._renderVisibility();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this.scrollToMenuItem(this.state.selectedIndex);
    //console.log('componentDidUpdate()', this.state.selectedIndex);
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
      <Paper 
        style={{outline: 0}}
        onKeyDown={this._handleMenuKeyDown}
        tabIndex = {1}
        ref="paperContainer"
        zDepth={this.props.zDepth} 
        className={classes}>

        {this._renderInput()}
        <div style={{height: this.childrenHeight, overflow: 'scroll', minHeight: 100}} ref="menuItems" >
          {this._getChildren()}
        </div>
        {this._renderDialog(this.state.searchValue)}
      </Paper>
    );
  },

  _renderInput: function() {
    
    if (this.props.enableFilter){
        return (
          <Input placeholder="Search here" 
            name="searchBox" 
            ref="searchBox" 
            onChange={this._onSearchValueChange}
            onKeyDown={this._handleSearchInputKeyDown}/>
        )
    }
  },

  _onSearchValueChange: function(e, value) {
    
    //console.log('onSearchValueChange(e, value)', value);
    
    var items = this.state.menuItems.map(function(item) {
      if(item.text.toLowerCase().indexOf(value.toLowerCase()) === -1) {
        item.isHide = true;
      } else {
        item.isHide = false;
      }
      return item;
    });

    var nextShowIndex = this._findNextVisibleItem();
    nextShowIndex = (nextShowIndex || nextShowIndex === 0) ? nextShowIndex : -1; 
    this.refs.customValueInput.setValue(value);
    this.setState({menuItems: items, searchValue: value, selectedIndex: nextShowIndex});
  },

  _handleMenuKeyDown: function(e) {
    //console.log('_handleMenuKeyDown(e)', e);
    var selectedIndex = this.state.selectedIndex;
    switch (e.keyCode) {
      case KeyCode.UP:
        selectedIndex = this._findPreviousVisibleItem(selectedIndex);
        this.setState({selectedIndex: selectedIndex});
        break;
      case KeyCode.DOWN:
        selectedIndex = this._findNextVisibleItem(selectedIndex);
        this.setState({selectedIndex: selectedIndex});        
        break;
      case KeyCode.ENTER: 
        if (selectedIndex > -1){
          this._onItemClick(null, selectedIndex);  
        } 
        
        break;
      case KeyCode.ESC:
        selectedIndex = this.props.selectedIndex;
        this.props.visible = false;
        this.setState({selectedIndex: selectedIndex});
        break;
    }
  },

  _handleSearchInputKeyDown: function(e) {
    switch (e.keyCode) {
      case KeyCode.ENTER:
        if (this.refs.searchBox.getValue() && !this._getVisibleMenuItemsLength()) {
          this._showDialog();
        }
        break;
    }
  },


  scrollToMenuItem: function(index) {
    var menuItemNode = this.refs.menuItems.getDOMNode();
    menuItemNode.scrollTop = KeyLine.Desktop.MENU_ITEM_HEIGHT * (index - 2);
    //console.log('scrollToMenuItem(index)', index, menuItemNode.scrollTop);
  },

  _getVisibleMenuItemsLength: function() {
    var items = this.state.menuItems.filter(function(item) {
      return !item.isHide;
    });

    return items.length;
  },

  _resetMenuItems: function() {
    //console.log('_resetMenuItems()');
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

    var inputStyle = {
      marginTop: 50,
      marginLeft: 30
    };

    return (
      <Dialog actions={dialogActions} ref="customValueDialog">
        <div style={inputStyle}>
          <Input name="customValue" ref="customValueInput" defaultValue={value} placeholder="Value" />
        </div>
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
      isSelected = i === this.state.selectedIndex;

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

  _findNextVisibleItem: function(index) {
    if (!index&&index!==0) index = -1;
    //console.log('_findNextVisibleItem', index);
    for (var i = index+1; i < this.state.menuItems.length + index + 1; i++) {
      var nextShowIndex = i%this.state.menuItems.length;
      if (!this.state.menuItems[nextShowIndex].isHide) {
        return nextShowIndex;
      }
    }
  },

  _findPreviousVisibleItem: function(index) {
    if (!index) index = this.state.menuItems.length;
    for (var i = this.state.menuItems.length + index-1; i >= index - 1; i--) {
      if (!this.state.menuItems[i%this.state.menuItems.length].isHide) {
        return i % this.state.menuItems.length;
      }
    }
  },

  _renderVisibility: function() {

    //console.log('_renderVisibility()', this.state.selectedIndex);

    var el;

    if (this.props.hideable) {
      el = this.getDOMNode();
      var innerContainer = this.refs.paperContainer.getInnerContainer().getDOMNode();
      
      if (this.props.visible) {
        this.childrenHeight = this._getMenuResultHeight(el);
        this.refs.paperContainer.getDOMNode().focus();
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
  },

  _onItemToggle: function(e, index, toggled) {
    if (this.props.onItemToggle) this.props.onItemToggle(e, index, this.props.menuItems[index], toggled);
  }

});

module.exports = Menu;