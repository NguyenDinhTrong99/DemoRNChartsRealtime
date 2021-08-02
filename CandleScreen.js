import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, processColor } from 'react-native'
import { CandleStickChart } from 'react-native-charts-wrapper'
import moment from 'moment'
import _ from 'lodash'

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const era = moment(moment().format('YYYY-MM-DD ') + '00:00:00', DATE_FORMAT)
const distanceToLoadMore = 10
const pageSize = 60
const maxRow = 700

const CandleScreen = () => {

    const [legend, setLegend] = useState({
        enabled: true,
        textSize: 14,
        form: 'CIRCLE',
        wordWrapEnabled: true
    })

    const [data, setData] = useState()

    const [marker, setMarker] = useState({
        enabled: true,
        markerColor: processColor('#2c3e50'),
        textColor: processColor('white'),
    })
    const [zoom, setZoom] = useState()
    const [xAxis, setXAxis] = useState({
        granularity: 1,
        granularityEnabled: true,
        position: 'BOTTOM',
        valueFormatter: 'date',
        valueFormatterPattern: 'HH:mm',
        since: moment().valueOf(),
        timeUnit: 'MINUTES',
        textColor:  processColor('white')
    })
    const [yAxis, setYAxis] = useState({
        left: { enabled: true
        },
        right: { textColor: processColor('white')},
    })

    const refChart = useRef()
    const xMax = useRef()
    const xMin = useRef()
    const isLoading = useRef(false)
    const stateZoom = useRef(undefined)

    /*

    useEffect(() => {
        const interval = setInterval(() => {

            // let shadowH = Math.random() * (94 - 90) + 90
            // let close = Math.random() * (92 - 90) + 90
            let shadowH = Math.random() * (101 - 98) + 98
            let close = Math.random() * (100 - 99) + 99

            // var values = [...data.dataSets[0].values]
            // values[values.length - 1] = itemUpdate
            var values = [...data.dataSets[0].values]
            const lastItem = values.pop()
            const itemUpdate = { ...lastItem, shadowH, close }
            values.push(itemUpdate)

            setData({
                ...data,
                dataSets: [{
                    ...data.dataSets[0],
                    values
                }]
            })

            // setXAxis({
            //     ...xAxis,
            //     limitLines: _.times( data.dataSets[0].values.length / 5, (i) => {
            //         return {
            //             limit: 5 * (i + 1) + 0.5,
            //             lineColor: processColor('green'),
            //             lineWidth: 1.5,
            //             label: (i + 1).toString()
            //         }
            //     })
            // })

            setYAxis({
                ...yAxis,
                left: {
                    limitLines: [{
                      limit: 112.4,
                      lineColor: processColor('red'),
                      lineDashPhase: 2,
                      lineDashLengths: [10,20]
                    }, {
                      limit: 89.47,
                      lineColor: processColor('red'),
                      lineDashPhase: 4,
                      lineDashLengths: [10,20]
                    }]
                  }
            })

        }, 1000)

        return () => clearInterval(interval)
    }, [data])

    */

    useEffect(() => {
        getData()
        // const tO = setTimeout(() => {
        //     let shadowH = Math.random() * (101 - 98) + 98
        //     let close = Math.random() * (100 - 99) + 99

        //     var values = [...data.dataSets[0].values]
        //     const newItem = { x: 48, shadowH, shadowL: 98.5, open: 98.6, close }
        //     values.push(newItem)

        //     setData({
        //         ...data,
        //         dataSets: [{
        //             ...data.dataSets[0],
        //             values
        //         }]
        //     })
        // }, 2000)
        // return () => clearTimeout(tO)
    }, [])
    
    const getIndexOfDay = day => {
        return moment(day, DATE_FORMAT).diff(era, 'days')
    }

    const getIndexOfMinutes = day => {
        return moment(day, DATE_FORMAT).diff(era, 'minutes')
    }

    const handleSelect = event => {
    }

    const handleOnchange = event => {
        const nativeEvent = event.nativeEvent

        if (nativeEvent.action == 'chartScaled') {
            const { scaleX, scaleY } = nativeEvent
            stateZoom.current = {
                ...stateZoom.current,
                scaleX, scaleY
            }
        }

        if (nativeEvent.action == 'chartTranslated') {
            let { left, right, centerX } = nativeEvent
            if (!isLoading.current) {
                if (xMin.current > left - distanceToLoadMore || right + distanceToLoadMore > xMax.current) {
                    isLoading.current = true
                    let toIndex = Math.min(centerX + pageSize, moment(moment(), DATE_FORMAT).diff(era, 'minutes'));
                    let fromIndex = toIndex - 2 * pageSize

                    let from = era.clone().add(fromIndex, 'minutes').format(DATE_FORMAT)
                    let to = era.clone().add(toIndex, 'minutes').format(DATE_FORMAT)

                    // isScroll = !(getIndexOfSeconds(to) < right)

                    mockLoadData(from, to).then((data) => {

                        let newData = generateNewData(from, to, data)
                        refChart.current.setDataAndLockIndex(newData.combinedData.candleData)

                        isLoading.current = false
                    })
                }
            }
        }
    }

    const mockLoadData = (from, to) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let fromIndex = getIndexOfMinutes(from)
                let toIndex = getIndexOfMinutes(to)

                xMin.current = fromIndex
                xMax.current = toIndex

                resolve(
                    Array.from(new Array(parseInt(toIndex - fromIndex)), (val, index) => {

                        let x = fromIndex + index;
                        let y = Math.abs(100 * Math.sin(0.1 * x))

                        let date = era.clone().add(x, 'minutes').format(DATE_FORMAT)
                        if (x % 2 == 0) {
                            return {
                                date: date,

                                shadowH: y + 220,
                                shadowL: y + 200,
                                open: y + 215,
                                close: y + 205,

                                ma5: y + 170,
                                ma15: y + 150,
                                volume: Math.abs(100 * Math.cos(0.1 * x)) + 100
                            }
                        } else {
                            return {
                                date: date,

                                shadowH: y + 220,
                                shadowL: y + 200,
                                open: y + 205,
                                close: y + 215,

                                ma5: y + 170,
                                ma15: y + 150,
                                volume: Math.abs(100 * Math.cos(0.1 * x)) + 100
                            }
                        }
                    }).filter(x => x))
            }, 50)
        })
    }

    const generateNewData = (from, to, data) => {
        var priceData = data.map(e => ({
            x: getIndexOfMinutes(e.date),
            shadowH: e.shadowH,
            shadowL: e.shadowL,
            open: e.open,
            close: e.close,
            date: e.date
        }))
        var ma5Data = data.map(e => ({ x: getIndexOfMinutes(e.date), y: e.ma5 }))
        var ma15Data = data.map(e => ({ x: getIndexOfMinutes(e.date), y: e.ma15 }))
        var volumeData = data.map(e => ({ x: getIndexOfMinutes(e.date), y: e.volume }))

        // limit row render 
        // const priceLength = priceData.length
        // priceData = priceLength > maxRow ? priceData.slice((priceLength - maxRow)) : priceData

        // const ma5Length = ma5Data.length
        // ma5Data = ma5Length > maxRow ? ma5Data.slice((ma5Length - maxRow)) : ma5Data

        // const ma15Length = ma15Data.length
        // ma15Data = ma15Length > maxRow ? ma15Data.slice((ma15Length - maxRow)) : ma15Data

        // const volumeLength = volumeData.length
        // volumeData = volumeLength > maxRow ? volumeData.slice((volumeLength - maxRow)) : volumeData

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

    const getData = () => {
        let today = moment(moment().format(DATE_FORMAT), DATE_FORMAT).format(DATE_FORMAT)
        let start = era.format(DATE_FORMAT)
        
        let axisMinimum = -0.5
        let axisMaximum = getIndexOfMinutes(today) + 0.5

        console.log(getIndexOfMinutes(today));


        mockLoadData(start, today)
            .then(data => {
                stateZoom.current =  stateZoom.current ?? { scaleX: 2, scaleY: 1, xValue: getIndexOfMinutes(today) - 5, yValue: 0, axisDependency: 'RIGHT' }
                const { candleData } = generateNewData(start, today, data).combinedData
                setData(candleData)
                setZoom(stateZoom.current)
                setXAxis({  ...xAxis, axisMinimum, axisMaximum  })
                setYAxis({  ...yAxis, axisMinimum, axisMaximum  })
            })
    }

    return (
        <View style={styles.container}>

            <CandleStickChart
                ref={refChart}
                group="stock"
                    identifier="price"
                style={styles.chart}
                data={data}
                marker={marker}
                visibleRange={{x: {min: 1, max: 100}}}
                chartDescription={{ text: 'CandleStick' }}
                legend={legend}
                xAxis={xAxis}
                yAxis={yAxis}
                syncX={true}
                syncY={false}
                maxVisibleValueCount={16}
                autoScaleMinMaxEnabled={true}
                zoom={zoom}
                onSelect={handleSelect}
                onChange={handleOnchange}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    chart: {
        flex: 1
    }
})

export default CandleScreen