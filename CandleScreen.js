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
        textColor: processColor('white'),
    })
    const [yAxis, setYAxis] = useState({
        left: {
            enabled: true
        },
        right: { textColor: processColor('white') },
    })

    const refChart = useRef()
    const xMax = useRef()
    const xMin = useRef()
    const isLoading = useRef(false)
    const stateZoom = useRef(undefined)
    const isScrolling = useRef(false)

    useEffect(() => {
        const interval = setInterval(() => {
            var values = [...data.dataSets[0].values]
            const lastItem = values.pop()
            let close = Math.random() * (lastItem.shadowH - lastItem.shadowL) + lastItem.shadowL
            const itemUpdate = { ...lastItem, close }
            values.push(itemUpdate)
            const maxLineLimit = Math.max(...Object.values(values).map(item => item.shadowH))
            const minLineLimit = Math.min(...Object.values(values).map(item => item.shadowL))

            setData({
                ...data,
                dataSets: [{
                    ...data.dataSets[0],
                    values
                }]
            })
            setYAxis({
                ...yAxis,
                left: {
                    limitLines: [{
                        limit: maxLineLimit,
                        lineColor: processColor('green'),
                        lineDashPhase: 1,
                        lineDashLengths: [5, 5]
                    }, {
                        limit: minLineLimit,
                        lineColor: processColor('green'),
                        lineDashPhase: 1,
                        lineDashLengths: [5, 5]
                    }]
                }
            })

        }, 1000)

        return () => clearInterval(interval)
    }, [data])

    useEffect(() => {
        getData()
        const tO = setInterval(() => {
            if (isScrolling.current == false) {
                console.log('im calling');
                getData()
            }
        }, 1000)
        return () => clearInterval(tO)
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
            isScrolling.current = true
            if (!isLoading.current) {
                if (xMin.current > left - distanceToLoadMore || right + distanceToLoadMore > xMax.current) {
                    isLoading.current = true
                    let toIndex = Math.min(centerX + pageSize, moment(moment(), DATE_FORMAT).diff(era, 'minutes'));
                    let fromIndex = toIndex - 2 * pageSize

                    let from = era.clone().add(fromIndex, 'minutes').format(DATE_FORMAT)
                    let to = era.clone().add(toIndex, 'minutes').format(DATE_FORMAT)

                    isScrolling.current = !((getIndexOfMinutes(to) - right <= 10))
                    console.log(isScrolling.current)

                    mockLoadData(from, to).then((data) => {
                        let { candleData } = generateNewData(from, to, data).combinedData
                        refChart.current.setDataAndLockIndex(candleData)
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
            date: e.date,
            marker: e.date + ''
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
        let axisMaximum = (getIndexOfMinutes(today) + 0.5)

        mockLoadData(start, today)
            .then(data => {
                stateZoom.current = stateZoom.current ?? { scaleX: 2, scaleY: 1, xValue: getIndexOfMinutes(today) - 5, yValue: 0, axisDependency: 'RIGHT' }
                const { candleData } = generateNewData(start, today, data).combinedData
                const priceData = candleData.dataSets[0].values
                const valueFormatter = []
                priceData.forEach((item, index) => {
                    valueFormatter.push(moment(item.date).format('HH:mm'))
                })
                const { x } = priceData[priceData.length - 1]
                setZoom(stateZoom.current)
                setData(candleData)
                setXAxis({ ...xAxis, valueFormatter, axisMinimum, axisMaximum })
                // setYAxis({ ...yAxis, axisMinimum, axisMaximum })
                if (isScrolling.current == false) {
                    refChart.current.moveViewToX(x)
                }
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
                visibleRange={{ x: { min: 1, max: 30 } }}
                chartDescription={{ text: 'CandleStick' }}
                legend={legend}
                xAxis={xAxis}
                yAxis={yAxis}
                syncX={true}
                syncY={false}
                maxVisibleValueCount={16}
                autoScaleMinMaxEnabled={false}
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