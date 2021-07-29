import React from 'react';
import { StyleSheet, View, Text, processColor, TouchableOpacity } from 'react-native';
import moment from 'moment'
import { BarChart, CombinedChart } from 'react-native-charts-wrapper';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const era = moment(moment().format('YYYY-MM-DD ') + '00:00:00', DATE_FORMAT)
const distanceToLoadMore = 10
const pageSize = 60
const maxRow = 700

class StockChart extends React.Component {
    constructor() {
        super();
        this.isLoading = false
        this.xMin = 0
        this.xMax = 0
        this.zoom = undefined
        this.isScroll = false
        this.time = 1
        this.interval = null
        this.timeType = 'minutes'
        this.formater = 'HH:mm'

        this.state = {
            priceXAxis: {
                drawLabels: false,
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: this.formater,
                since: moment().valueOf(),
                timeUnit: this.timeType.toUpperCase()
            },
            volumeXAxis: {
                drawLabels: true,
                position: 'BOTTOM',
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: this.formater,
                since: moment().valueOf(),
                timeUnit: this.timeType.toUpperCase()
            },

            visibleRange: { x: { min: 1, max: 50 } },
            today: moment().format(DATE_FORMAT),
            timeInterval: 60000 // 1m

        }
    }



    getIndexOfDay(day) {
        return moment(day, DATE_FORMAT).diff(era, 'days')
    }

    getIndexOfSeconds(day) {
        return moment(day, DATE_FORMAT).diff(era, 'minutes')
    }

    getIndexOfSeconds(day) {
        return moment(day, DATE_FORMAT).diff(era, this.timeType)
    }

    generateNewData(from, to, data) {
        var priceData = data.map(e => ({
            x: this.getIndexOfSeconds(e.date),
            shadowH: e.shadowH,
            shadowL: e.shadowL,
            open: e.open,
            close: e.close,
            date: e.date
        }))
        var ma5Data = data.map(e => ({ x: this.getIndexOfSeconds(e.date), y: e.ma5 }))
        var ma15Data = data.map(e => ({ x: this.getIndexOfSeconds(e.date), y: e.ma15 }))
        var volumeData = data.map(e => ({ x: this.getIndexOfSeconds(e.date), y: e.volume }))

        // limit row render 
        const priceLength = priceData.length
        priceData = priceLength > maxRow ? priceData.slice((priceLength - maxRow)) : priceData

        const ma5Length = ma5Data.length
        ma5Data = ma5Length > maxRow ? ma5Data.slice((ma5Length - maxRow)) : ma5Data

        const ma15Length = ma15Data.length
        ma15Data = ma15Length > maxRow ? ma15Data.slice((ma15Length - maxRow)) : ma15Data

        const volumeLength = volumeData.length
        volumeData = volumeLength > maxRow ? volumeData.slice((volumeLength - maxRow)) : volumeData

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
                let fromIndex = this.getIndexOfSeconds(from)
                let toIndex = this.getIndexOfSeconds(to)

                this.xMin = fromIndex
                this.xMax = toIndex

                resolve(
                    Array.from(new Array(parseInt(toIndex - fromIndex)), (val, index) => {

                        let x = fromIndex + index;
                        let y = Math.abs(100 * Math.sin(0.1 * x))

                        let date = era.clone().add(x, this.timeType).format(DATE_FORMAT)
                        if (x % 2 == 0) {
                            return {
                                date: date,

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
                                date: date,

                                shadowH: y + 220,
                                shadowL: y + 180,
                                open: y + 200,
                                close: y + 190,

                                ma5: y + 170,
                                ma15: y + 150,
                                volume: Math.abs(100 * Math.cos(0.1 * x)) + 100
                            }
                        }
                    }).filter(x => x))
            }, 50)
        })
    }

    componentDidMount() {
        this.getData()
        this.getDataWithTime()
    }

    getDataWithTime() {
        console.log('i running');
        this.interval = setInterval(() => {
            if (!this.isScroll) {
                this.isScroll = true
                this.setState({
                    ...this.state,
                    ...this.zoom,
                    today: moment(this.state.today, DATE_FORMAT).add(this.time, this.timeType).format(DATE_FORMAT)
                })
                this.getData()
            }
        }, this.state.timeInterval)
        this.interval
    }

    getData() {
        let today = moment(this.state.today, DATE_FORMAT).format(DATE_FORMAT)
        let start = era.format(DATE_FORMAT)
        let axisMinimum = this.getIndexOfDay(era) - 0.5;
        let axisMaximum = this.getIndexOfSeconds(today) + 0.5;

        this.mockLoadData(start, today).then((data) => {
            this.zoom = this.zoom ?? { scaleX: 2, scaleY: 1, xValue: this.getIndexOfSeconds(today) - 5, yValue: 0, axisDependency: 'RIGHT' }
            this.setState({
                ...this.generateNewData(start, today, data),
                zoom: this.zoom,
                priceXAxis: { ...this.state.priceXAxis, axisMinimum, axisMaximum },
                volumeXAxis: { ...this.state.volumeXAxis, axisMinimum, axisMaximum }
            })
            this.isScroll = false
        })
    }

    handleChange(event) {
        let nativeEvent = event.nativeEvent
        if (nativeEvent.action == 'chartScaled') {
            const { scaleX, scaleY } = nativeEvent
            this.zoom = {
                ...this.state.zoom,
                scaleX, scaleY
            }
        }
        if (nativeEvent.action == 'chartTranslated') {
            let { left, right, centerX } = nativeEvent
            this.isScroll = true
            if (!this.isLoading) {

                if (this.xMin > left - distanceToLoadMore || right + distanceToLoadMore > this.xMax) {

                    let toIndex = Math.min(centerX + pageSize, moment(this.state.today).diff(era, this.timeType));
                    let fromIndex = toIndex - 2 * pageSize;

                    let from = era.clone().add(fromIndex, this.timeType).format(DATE_FORMAT)
                    let to = era.clone().add(toIndex, this.timeType).format(DATE_FORMAT)

                    this.isScroll = !(this.getIndexOfSeconds(to) < right)

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

    //@type: number
    // 0: 1m; 1: 3m; 2: 5m
    onChangeTime = async type => {
        clearInterval(this.interval)
        var timeInterval = 0
        var time = 1
        switch (type) {
            case 0:
                timeInterval = 60000
                break
            case 1:
                timeInterval = 180000
                time = 3
                break
            case 2:
                time = 5
                timeInterval = 30000
                break
        }
        this.timeType = 'minutes'
        this.formater = 'HH:mm'
        this.time = time
        this.zoom = this.zoom ?? { scaleX: 2, scaleY: 1, xValue: this.getIndexOfSeconds(today) - 5, yValue: 0, axisDependency: 'RIGHT' }

        await this.setState({
            ...this.state,
            priceXAxis: {
                drawLabels: false,
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: this.formater,
                since: moment().valueOf(),
                timeUnit: this.timeType.toUpperCase()
            },
            volumeXAxis: {
                drawLabels: true,
                position: 'BOTTOM',
                granularity: 1,
                granularityEnabled: true,
                valueFormatter: 'date',
                valueFormatterPattern: this.formater,
                since: moment().valueOf(),
                timeUnit: this.timeType.toUpperCase()
            },
            timeInterval,
            timeType: this.timeType
        })

        this.getDataWithTime()

    }

    _renderButtonChooseTime() {

        return (
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}
                    onPress={() => this.onChangeTime(0)}>
                    <Text style={styles.textButton}>1m</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}
                    onPress={() => this.onChangeTime(1)}>
                    <Text style={styles.textButton}>3m</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}
                    onPress={() => this.onChangeTime(2)}>
                    <Text style={styles.textButton}>5m</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
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
                    doubleTapToZoomEnabled={false}
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
                    yAxis={{ left: { enabled: false }, right: { enabled: false, position: 'INSIDE_CHART', textColor: processColor('black') } }}
                    ref="volumeChart"
                    doubleTapToZoomEnabled={false}
                    chartDescription={{ text: "" }}
                    style={styles.volume} />

                {this._renderButtonChooseTime()}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 4
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
    },
    textButton: {
        color: 'white'
    }
});

export default StockChart;