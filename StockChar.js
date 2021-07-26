import React from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Button,
    View, processColor, TouchableOpacity
} from 'react-native';

import moment from 'moment'

import { BarChart, CombinedChart } from 'react-native-charts-wrapper';


const era = moment('1970-01-01', DATE_FORMAT)
const distanceToLoadMore = 10
const pageSize = 60
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

class StockChartScreen extends React.Component {
    constructor() {
        super();

        this.isLoading = false
        this.xMin = 0
        this.xMax = 0

        this.state = {
            priceXAxis: {
                drawLabels: false,
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: 'MM-dd',
                since: 0,
                timeUnit: 'DAYS'
            },
            volumeXAxis: {
                drawLabels: true,
                position: 'BOTTOM',
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: 'MM-dd',
                since: 0,
                timeUnit: 'DAYS'
            },

            visibleRange: { x: { min: 1, max: 50 } },
        }
    }



    getIndexOfDay(day) {
        return moment(day, DATE_FORMAT).diff(era, 'days')
    }

    generateNewData(from, to, data) {

        let fromIndex = this.getIndexOfDay(from)
        let toIndex = this.getIndexOfDay(to)

        var priceData = data.map(e => ({
            x: this.getIndexOfDay(e.date),
            shadowH: e.shadowH,
            shadowL: e.shadowL,
            open: e.open,
            close: e.close,
            date: e.date
        }))
        var ma5Data = data.map(e => ({ x: this.getIndexOfDay(e.date), y: e.ma5 }))
        var ma15Data = data.map(e => ({ x: this.getIndexOfDay(e.date), y: e.ma15 }))
        var volumeData = data.map(e => ({ x: this.getIndexOfDay(e.date), y: e.volume }))

        return {

            combinedData: {
                lineData: {
                    dataSets: [{
                        values: ma5Data,
                        label: 'ma5',

                        config: {
                            drawValues: false,
                            mode: "CUBIC_BEZIER",
                            drawCircles: false,
                            color: processColor('red')
                        }
                    }, {
                        values: ma15Data,
                        label: 'ma15',

                        config: {
                            drawValues: false,
                            mode: "CUBIC_BEZIER",
                            drawCircles: false,
                            color: processColor('blue')
                        }
                    }],
                },
                candleData: {
                    dataSets: [{
                        values: priceData,
                        label: 'price',

                        config: {
                            drawValues: false,
                            highlightColor: processColor('darkgray'),
                            shadowColor: processColor('black'),
                            shadowWidth: 1,
                            shadowColorSameAsCandle: true,
                            increasingColor: processColor('#71BD6A'),
                            increasingPaintStyle: 'FILL',
                            decreasingColor: processColor('#D14B5A')
                        }
                    }],
                }
            },


            volumeData: {
                dataSets: [{

                    values: volumeData,
                    label: 'volume',
                    config: {
                        drawValues: false,
                        colors: [processColor('red'), processColor('green')]
                    }
                }]

            },


        }

    }

    mockLoadData(from, to) {
        return new Promise(resolve => {
            setTimeout(() => {

                let fromIndex = this.getIndexOfDay(from)
                let toIndex = this.getIndexOfDay(to)

                this.xMin = fromIndex
                this.xMax = toIndex

                resolve(
                    Array.from(new Array(parseInt(toIndex - fromIndex)), (val, index) => {

                        let x = fromIndex + index;

                        let y = Math.abs(100 * Math.sin(0.1 * x))

                        let date = era.clone().add(x, 'days');


                        // no data in weekend
                        if (date.isoWeekday() < 6) {

                            if (x % 2 == 0) {
                                return {
                                    date: date.format(DATE_FORMAT),

                                    shadowH: y + 220,
                                    shadowL: y + 180,
                                    open: y + 190,
                                    close: y + 200,

                                    ma5: y + 170,
                                    ma15: y + 150,
                                    volume: Math.abs(100 * Math.cos(0.1 * x)) + 100
                                }
                            } else {
                                return {
                                    date: date.format(DATE_FORMAT),

                                    shadowH: y + 220,
                                    shadowL: y + 180,
                                    open: y + 200,
                                    close: y + 190,

                                    ma5: y + 170,
                                    ma15: y + 150,
                                    volume: Math.abs(100 * Math.cos(0.1 * x)) + 100
                                }
                            }
                        } else {
                            return null
                        }
                    }).filter(x => x))
            }, 50)
        })
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        let today = moment().format(DATE_FORMAT)
        let start = moment().add(-2 * pageSize, 'days').format(DATE_FORMAT)

        // for example, this company ipo at 2017-1-1, you can get this information from your server
        let axisMinimum = this.getIndexOfDay('2021-01-01') - 0.5;
        let axisMaximum = this.getIndexOfDay(today) + 0.5;


        this.mockLoadData(start, today).then((data) => {
            this.setState({
                ...this.generateNewData(start, today, data),
                zoom: { scaleX: 1, scaleY: 1, xValue: this.getIndexOfDay(today) - 5, yValue: 0, axisDependency: 'RIGHT' },
                priceXAxis: { ...this.state.priceXAxis, axisMinimum: axisMinimum, axisMaximum: axisMaximum },
                volumeXAxis: { ...this.state.volumeXAxis, axisMinimum: axisMinimum, axisMaximum: axisMaximum }
            })
        })
    }

    handleChange(event) {
        let nativeEvent = event.nativeEvent

        if (nativeEvent.action == 'chartTranslated') {
            let { left, right, centerX } = nativeEvent

            if (!this.isLoading) {

                if (this.xMin > left - distanceToLoadMore || right + distanceToLoadMore > this.xMax) {
                    this.isLoading = true

                    // Because of the implementation of MpAndroidChart, if the action of setDataAndLockIndex is triggered by user dragging,
                    // then the size of new data should be equal to original data, otherwise the calculation of position transition won't be accurate,
                    // use may find the chart suddenly blink to another position.
                    // This restriction only exists in android, in iOS, we have no such problem.

                    let toIndex = Math.min(centerX + pageSize, moment().diff(era, 'days'));
                    let fromIndex = toIndex - 2 * pageSize;

                    let from = era.clone().add(fromIndex, 'days').format(DATE_FORMAT)
                    let to = era.clone().add(toIndex, 'days').format(DATE_FORMAT)

                    this.mockLoadData(from, to).then((data) => {

                        let newData = this.generateNewData(from, to, data);

                        this.refs.priceChart.setDataAndLockIndex(newData.combinedData)
                        this.refs.volumeChart.setDataAndLockIndex(newData.volumeData)

                        this.isLoading = false

                    })
                }
            }
        }
    }

    async handleType(number) {
        var result = { valueFormatterPattern: 'mm:ss', timeUnit: 'SECONDS' }
        switch (number) {
            case 1:
                result = { valueFormatterPattern: 'HH:mm', timeUnit: 'MINUTES' }
                break
            case 2:
                result = { valueFormatterPattern: 'HH:mm', timeUnit: 'HOURS' }
                break
            case 3:
                result = { valueFormatterPattern: 'MM-dd', timeUnit: 'DAYS' }
                break
        }
        await this.setState({
            ...this.state,
            priceXAxis: {
                ...this.state.priceXAxis,
                ...result
            },
            volumeXAxis: {
                ...this.state.volumeXAxis,
                ...result
            }
        })
        this.getData()
    }

    render() {
        console.log(this.state.priceXAxis);
        return (
            <View style={styles.container}>

                <CombinedChart
                    data={this.state.combinedData}
                    xAxis={this.state.priceXAxis}
                    onChange={(event) => this.handleChange(event)}
                    visibleRange={this.state.visibleRange}
                    zoom={this.state.zoom}

                    group="stock"
                    identifier="price"
                    syncX={true}
                    syncY={false}


                    dragDecelerationEnabled={false}
                    yAxis={{ left: { enabled: false }, right: { position: 'INSIDE_CHART', textColor: processColor('black') } }}
                    ref="priceChart"
                    doubleTapToZoomEnabled={false}  // it has to be false!!
                    chartDescription={{ text: "" }}
                    legend={{ verticalAlignment: "TOP" }}
                    style={styles.price} />


                <BarChart
                    data={this.state.volumeData}
                    xAxis={this.state.volumeXAxis}
                    onChange={(event) => this.handleChange(event)}
                    visibleRange={this.state.visibleRange}
                    zoom={this.state.zoom}

                    group="stock"
                    identifier="volume"
                    syncX={true}
                    syncY={false}


                    dragDecelerationEnabled={false}
                    yAxis={{ left: { enabled: false }, right: { position: 'INSIDE_CHART', textColor: processColor('black') } }}
                    ref="volumeChart"
                    doubleTapToZoomEnabled={false}  // it has to be false!!
                    chartDescription={{ text: "" }}
                    style={styles.volume} />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}
                        onPress={() => this.handleType(0)}>
                        <Text>1s</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={() => this.handleType(1)}>
                        <Text>1m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={() => this.handleType(2)}>
                        <Text>1h</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={() => this.handleType(3)}>
                        <Text>1d</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    price: {
        flex: 4
    },
    volume: {
        flex: 1
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    button: {
        margin: 4,
        backgroundColor: 'green',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 6,
        width: 40
    }
});

export default StockChartScreen;