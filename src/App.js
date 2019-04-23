import React, {Component} from 'react';
import CSVReader from 'react-csv-reader'
import './App.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            creativeCPV: [],
            rotationCPV: []
        };
        this.handleRotations = this.handleRotations.bind(this);
        this.handleSpots = this.handleSpots.bind(this);
        this.checkUploads = this.checkUploads.bind(this);
        this.calculateCPVCreative = this.calculateCPVCreative.bind(this);
        this.calculateCPVRotation = this.calculateCPVRotation.bind(this);
    }

    handleRotations = file => {
        this.setState({rotations: file});
        this.checkUploads();
    }

    handleSpots = file =>{
        this.setState({spots: file});
        this.checkUploads();
    }

    checkUploads() {
        if(this.state.rotations &&
           this.state.rotations.length > 0 &&
           this.state.spots &&
           this.state.spots.length > 0) {
            this.calculateCPVCreative();
            this.calculateCPVRotation();
        }
    }

    calculateCPVCreative() {
        let summary_views = [];
        let summary_costs = [];
        for (let i = 0; i < this.state.spots.length; i++) {
            if (i === 0) {
                continue;
            }
            if (2 in this.state.spots[i]) {
                if (this.state.spots[i][2] in summary_views) {
                    summary_views[this.state.spots[i][2]] += parseFloat(this.state.spots[i][3]);
                    summary_costs[this.state.spots[i][2]] += parseFloat(this.state.spots[i][4]);
                } else {
                    summary_views[this.state.spots[i][2]] = parseFloat(this.state.spots[i][3]);
                    summary_costs[this.state.spots[i][2]] = parseFloat(this.state.spots[i][4]);
                }
            }
        }
        let summary = [];
        for (let key in summary_costs){
            summary.push('The creative ' + key + ' has a cpv of ' + (summary_costs[key]/summary_views[key]))
        }
        this.setState({creativeCPV: summary});
    }

    calculateCPVRotation() {
        let rotations = [];
        for (let i = 0; i < this.state.rotations.length; i++) {
            if (i === 0) {
                continue;
            }

            if (1 in this.state.rotations[i]) {
                let name = this.state.rotations[i][2];
                let start = this.changeToTwentyFour(this.state.rotations[i][0]);
                let end = this.changeToTwentyFour(this.state.rotations[i][1]);
                rotations.push({name: name, start: start, end: end});
            }
        }
        let summary_views = [];
        let summary_costs = [];
        for (let i = 0; i < this.state.spots.length; i++) {
            if (i === 0) {
                continue;
            }
            if (1 in this.state.spots[i]) {
                for (let key in rotations) {
                    let spot_time = this.changeToTwentyFour(this.state.spots[i][1]);
                    if (spot_time <= rotations[key].end && spot_time >= rotations[key].start) {
                        if (rotations[key].name + '__' + this.state.spots[i][0] in summary_views) {
                            summary_views[rotations[key].name + '__' + this.state.spots[i][0]] += parseFloat(this.state.spots[i][3]);
                            summary_costs[rotations[key].name + '__' + this.state.spots[i][0]] += parseFloat(this.state.spots[i][4]);
                        } else {
                            summary_views[rotations[key].name + '__' + this.state.spots[i][0]] = parseFloat(this.state.spots[i][3]);
                            summary_costs[rotations[key].name + '__' + this.state.spots[i][0]] = parseFloat(this.state.spots[i][4]);
                        }
                    }
                }
            }
        }
        let summary = [];
        for (let key in summary_costs){
            let temp = key.split('__');
            summary.push('The ' + temp[0] + ' rotation  on ' + temp[1] + ' has a cpv of ' + (summary_costs[key]/summary_views[key]))
        }
        this.setState({rotationCPV: summary});
    }

    changeToTwentyFour(time) {
        let reg = /([0-9]+):([0-9]+) ([A-Z]{2})/g;
        let match = reg.exec(time);
        let result = parseInt(match[1]+match[2]);
        if (match[3] === 'PM' && match[1] !== '12') {
            result += 1200;
        }
        return result;
    }

    render() {
        const creative_items = this.state.creativeCPV.map((item, key) =>
            <li key={key}> {item} </li>
        );
        const rotation_items = this.state.rotationCPV.map((item, key) =>
            <li key={key}> {item} </li>
        );
        return (
            <div className="App">
                <header class="o-cpv__header">
                    CPV Calculator
                </header>
                <CSVReader
                    cssClass="csv-reader-input"
                    label="Select CSV with Rotations"
                    onFileLoaded={this.handleRotations}
                    inputId="rotations"
                    inputStyle={{color: 'red'}}
                />
                <br/>
                <CSVReader
                    cssClass="csv-reader-input"
                    label="Select CSV with Spots"
                    onFileLoaded={this.handleSpots}
                    inputId="rotations"
                    inputStyle={{color: 'red'}}
                />
                <br/>
                <ul>
                    {creative_items}
                </ul>
                <br/>
                <ul>
                    {rotation_items}
                </ul>
            </div>
        );
    }
}

export default App;
