import React from 'react';
import logo from './logo.svg';
import './App.css';
//import * as mp from "./clean.mp";

const MessagePack = require("what-the-pack");
const {encode, decode} = MessagePack.initialize(2**24);

let words = 0;

async function getData() {
  let res = await fetch("clean.mp");
  let buf = await res.arrayBuffer();
  console.log(buf);
  return decode(MessagePack.Buffer.from(buf));
}

interface AppState {
  data: {
    info: string
  } | Array<any>;
  showFuncs: boolean;
}

interface FileEntryProps {
  name: string;
  data: any[];
  showFuncs: boolean;
}

class FileEntry extends React.Component<FileEntryProps> {
  render() {
    let ans = [];
    let ind = 0;
    for (let x of this.props.data) {
      if ("0" in x) {
        ans.push(<div key={ind++} className="text">{x[0]}</div>);
      }
      if ("1" in x && this.props.showFuncs) {
        ans.push(<div key={ind++} className="func">F{x[1][0]}({x[1][1].join(", ")})</div>)
      }
    }
    return <div className="entry">
      <div className="name">{this.props.name}</div>
      <div className="val">{ans}</div>
    </div>
  }
}

interface FileProps {
  name: string;
  data: any[];
  showFuncs: boolean;
}

interface FileState {
  open: boolean;
}

class File extends React.Component<FileProps, FileState> {

  constructor(props: FileProps) {
    super(props);
    this.state = {open: false};
  }

  render() {
    let ans = null;
    if (this.state.open) {
      ans = [];
      for (let x of this.props.data[0]) {
        ans.push(<FileEntry key={x[0]} name={x[0]} data={x[1]} showFuncs={this.props.showFuncs} />)
      }
    }
  
    return <div className="file">
      <h1 onClick={() => this.setState({open: !this.state.open})}>{this.props.name}</h1>
      {ans}
    </div>
  }

}

interface FolderProps {
  name: string;
  data: any[];
  showFuncs: boolean;
}

interface FolderState {
  open: boolean;
}

class Folder extends React.Component<FolderProps, FolderState> {

  constructor(props: FolderProps) {
    super(props);
    this.state = {open: false};
  }

  render() {
    let children = null;
    let d = this.props.data;
    if (this.state.open) {
      children = [];
      for (let name of Object.keys(d[0])) {
        children.push(<Folder key={children.length} name={name} data={d[0][name]} showFuncs={this.props.showFuncs} />);
      }
      for (let name of Object.keys(d[1])) {
        children.push(<File key={children.length} name={name} data={d[1][name]} showFuncs={this.props.showFuncs} />);
      }
    }
    return <div className="folder">
      <h1 onClick={() => this.setState({open: !this.state.open})}>{this.props.name}</h1>
        <div className="children">
          {children}
        </div>
    </div>
  }
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {data: {info: "loading"}, showFuncs: true};
    
  }

  componentDidMount() {
    getData().then(d => {
      this.setState({data: d});
    }).catch(r => {
      console.log(r);
    });
  }


  render() {
    if ("info" in this.state.data) {
      return <div>Loading</div>
    }
    return <div>
      <input type="checkbox" id="showFuncs" checked={this.state.showFuncs} onChange={() => this.setState({showFuncs: !this.state.showFuncs})}></input>
      <label htmlFor="showFuncs">Show Functions</label>
      <Folder name="/" data={this.state.data} showFuncs={this.state.showFuncs} />
    </div>
  }
}

export default App;
