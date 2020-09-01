import React, {Component} from 'react';
import './App.css';
import './FileSystem.css'
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ArrowBack from '@material-ui/icons/ArrowBack';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import FolderIcon from '@material-ui/icons/Folder';
import pathLib from 'path'
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import { IconButton } from '@material-ui/core'


/**
 * TODO:
 *  - Cleanup cleanup/organize classes and better styling
 *  - See API TODO for possible data structure changes
 */

class App extends Component {
  constructor() {
    super()
    this.newImage = this.newImage.bind(this)
    this.newFolder = this.newFolder.bind(this)
    this.backParent = this.backParent.bind(this)
  }
  state = {folder: {}, openFolders: {}}

  newImage (file) {
    this.setState({ imageData: file.data})
  }

  newFolder (folder) {
    this.setState({ folder, imageData: (folder.files[0] && folder.files[0].data) || 'noSelection' })
  }

  backParent (child) {
    // Navigate from root down to parent
    // A little hacky see API for better data structure
    const directories = child.path.split(/\//)
    let folder = this.state.root
    let path = directories.shift()
    while (path !== this.state.root.path) {
      path = `${path}/${directories.shift()}`
    }
    while (directories.length > 1) {
      path = `${path}/${directories.shift()}`
      folder = folder.folders[path]
    }
    this.newFolder(folder)
  }

  async componentDidMount() {
    const folder = await (await fetch('/files')).json()
    this.setState({root: folder, folder, imageData: folder.files[0].data})
  }

  render() {
    return (
      <div className="App">
        <h1>{this.state.folder ? this.state.folder.path : '<N/A>'}</h1>
        
        <div class='FileSystem'>
        <FileSystemList folder={this.state.folder} newImage={this.newImage} newFolder={this.newFolder} openFolders={this.state.openFolders} backParent={this.backParent}/>
          {this.state.imageData === 'noSelection' ? <div>No Selection</div> : 
            <img alt='<no data>' src={`data:image/jpeg;base64, ${this.state.imageData}`}/>
          }
        </div>
      </div>
    );
  }
}

class FileSystemList extends Component {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick (e) {
    this.props.backParent(this.props.folder)
  }
  render() {
    const folder = this.props.folder || {}
    if (!folder.files) return <div></div>
    const fileComponents = folder.files.map(file => <FileEntry key={file.path} {...file} newImage={this.props.newImage}/>)
    const folderComponents = Object.values(folder.folders).map(folder => <FolderEntry key={folder.path} {...folder} newFolder={this.props.newFolder} isOpen={this.props.openFolders[folder.path]} openFolders/>)
    return (
      <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          <IconButton onClick={this.handleClick}><ArrowBack></ArrowBack></IconButton>
          {this.props.folder.path}
        </ListSubheader>
      }
    >
      {[fileComponents, folderComponents]}
    </List>
    );
  }
}


class FolderEntry extends Component {
  state = {isOpen: false}
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick (e) {
    this.props.newFolder(this.props)
  }
  render() { return <ListItem key={this.props.path + "-item"} button onClick={this.handleClick}>
    <ListItemIcon key={this.props.path + '-icon'}>
      {this.props.isOpen ? <FolderOpenIcon /> : <FolderIcon />}
    </ListItemIcon>
    <ListItemText primary={pathLib.basename(this.props.path)} key={this.props.path + '-text'}/>
    <Collapse in={this.props.isOpen} timeout="auto" unmountOnExit key={this.props.path + '-collapse'}>
      <List
        key={this.props.path + '-collapseList'}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader key={this.props.path + '-subHeader'} component="div" id="nested-list-subheader">
            {this.props.path}
          </ListSubheader>
        }
      >
        {this.props.files.map(file => <FileEntry key={file.path} {...file} newImage={this.props.newImage}/>)}
        {Object.values(this.props.folders).map(folder => <FolderEntry key={folder.path} {...folder} newFolder={this.props.newFolder} isOpen={this.props.openFolders[folder.path]} openFolders/>)}
      </List>
    </Collapse>
  </ListItem>
  }
}

class FileEntry extends Component {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick (e) {
    this.props.newImage(this.props)
  }
  render() { return <ListItem key={this.props.path + '-listItem'} button onClick={this.handleClick}>
    <ListItemIcon key={this.props.path + '-listItemIcon'}>
      <InsertDriveFileIcon key={this.props.path + '-icon'} />
    </ListItemIcon>
    <ListItemText key={this.props.path + '-text'} primary={pathLib.basename(this.props.path)}/>
  </ListItem>
  }
}

export default App


