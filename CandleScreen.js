import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, processColor } from 'react-native'
import { CandleStickChart } from 'react-native-charts-wrapper';
import moment from 'moment';
const CandleScreen = () => {

    const [legend, setLegend] = useState({
        enabled: true,
        textSize: 14,
        form: 'CIRCLE',
        wordWrapEnabled: true
    })

    const [data, setData] = useState({
        dataSets: [{
            values: [
                { x: 0, shadowH: 101.76, shadowL: 100.4, open: 100.78, close: 101.03 },
                { x: 1, shadowH: 101.58, shadowL: 100.27, open: 101.31, close: 101.12 },
                { x: 2, shadowH: 102.24, shadowL: 100.15, open: 101.41, close: 101.17 },
                { x: 3, shadowH: 102.28, shadowL: 101.5, open: 102.24, close: 102.23 },
                { x: 4, shadowH: 102.91, shadowL: 101.78, open: 101.91, close: 102.52 },
                { x: 5, shadowH: 105.18, shadowL: 103.85, open: 103.96, close: 104.58 },
                { x: 6, shadowH: 106.31, shadowL: 104.59, open: 104.61, close: 105.97 },
                { x: 7, shadowH: 106.47, shadowL: 104.96, open: 105.52, close: 105.8 },
                { x: 8, shadowH: 106.5, shadowL: 105.19, open: 106.34, close: 105.92 },
                { x: 9, shadowH: 107.65, shadowL: 105.1401, open: 105.93, close: 105.91 },
                { x: 10, shadowH: 107.29, shadowL: 105.21, open: 105.25, close: 106.72 },
                { x: 11, shadowH: 107.07, shadowL: 105.9, open: 106.48, close: 106.13 },
                { x: 12, shadowH: 106.25, shadowL: 104.89, open: 105.47, close: 105.67 },
                { x: 13, shadowH: 106.19, shadowL: 105.06, open: 106, close: 105.19 },
                { x: 14, shadowH: 107.79, shadowL: 104.88, open: 104.89, close: 107.7 },
                { x: 15, shadowH: 110.42, shadowL: 108.6, open: 108.65, close: 109.56 },
                { x: 16, shadowH: 109.9, shadowL: 108.88, open: 109.72, close: 108.99 },
                { x: 17, shadowH: 110, shadowL: 108.2, open: 108.78, close: 109.99 },
                { x: 18, shadowH: 112.19, shadowL: 110.27, open: 110.42, close: 111.08 },
                { x: 19, shadowH: 110.73, shadowL: 109.42, open: 109.51, close: 109.81 },
                { x: 20, shadowH: 110.98, shadowL: 109.2, open: 110.23, close: 110.96 },
                { x: 21, shadowH: 110.42, shadowL: 108.121, open: 109.95, close: 108.54 },
                { x: 22, shadowH: 109.77, shadowL: 108.17, open: 108.91, close: 108.66 },
                { x: 23, shadowH: 110.61, shadowL: 108.83, open: 108.97, close: 109.04 },
                { x: 24, shadowH: 110.5, shadowL: 108.66, open: 109.34, close: 110.44 },
                { x: 25, shadowH: 112.34, shadowL: 110.8, open: 110.8, close: 112.0192 },
                { x: 26, shadowH: 112.39, shadowL: 111.33, open: 111.62, close: 112.1 },
                { x: 27, shadowH: 112.3, shadowL: 109.73, open: 112.11, close: 109.85 },
                { x: 28, shadowH: 108.95, shadowL: 106.94, open: 108.89, close: 107.48 },
                { x: 29, shadowH: 108, shadowL: 106.23, open: 107.88, close: 106.91 },
                { x: 30, shadowH: 108.09, shadowL: 106.06, open: 106.64, close: 107.13 },
                { x: 31, shadowH: 106.93, shadowL: 105.52, open: 106.93, close: 105.97 },
                { x: 32, shadowH: 106.48, shadowL: 104.62, open: 105.01, close: 105.68 },
                { x: 33, shadowH: 105.65, shadowL: 104.51, open: 105, close: 105.08 },
                { x: 34, shadowH: 105.3, shadowL: 103.91, open: 103.91, close: 104.35 },
                { x: 35, shadowH: 98.71, shadowL: 95.68, open: 96, close: 97.82 },
                { x: 36, shadowH: 97.88, shadowL: 94.25, open: 97.61, close: 94.8075 },
                { x: 37, shadowH: 94.72, shadowL: 92.51, open: 93.99, close: 93.75 },
                { x: 38, shadowH: 94.08, shadowL: 92.4, open: 93.965, close: 93.65 },
                { x: 39, shadowH: 95.74, shadowL: 93.68, open: 94.2, close: 95.18 },
                { x: 40, shadowH: 95.9, shadowL: 93.82, open: 95.2, close: 94.19 },
                { x: 41, shadowH: 94.07, shadowL: 92.68, open: 94, close: 93.24 },
                { x: 42, shadowH: 93.45, shadowL: 91.85, open: 93.37, close: 92.72 },
                { x: 43, shadowH: 93.77, shadowL: 92.59, open: 93, close: 92.82 },
                { x: 44, shadowH: 93.57, shadowL: 92.11, open: 93.33, close: 93.39 },
                { x: 45, shadowH: 93.57, shadowL: 92.46, open: 93.48, close: 92.51 },
                { x: 46, shadowH: 92.78, shadowL: 89.47, open: 92.72, close: 90.32 },
                { x: 47, shadowH: 91.67, shadowL: 90, open: 90, close: 90.52 }
            ],
            label: 'AAPL',
            config: {
                highlightColor: processColor('darkgray'),

                shadowColor: processColor('black'),
                shadowWidth: 1,
                shadowColorSameAsCandle: true,
                increasingColor: processColor('#71BD6A'),
                increasingPaintStyle: 'FILL',
                decreasingColor: processColor('#D14B5A')
            },
            xAxis: {},
            yAxis: {}
        }],
    })

    const [marker, setMarker] = useState({
        enabled: true,
        markerColor: processColor('#2c3e50'),
        textColor: processColor('white'),
    })
    const [zoom, setZoom] = useState(0)
    const [xAxis, setXAxis] = useState({
        position: 'BOTTOM',
        valueFormatter: 'date',
        valueFormatterPattern: 'HH:mm',
        since: moment().valueOf(),
        timeUnit: 'MINUTES'
    })
    const [yAxis, setYAxis] = useState({
        left: { enabled: false }
    })

    const refChart = useRef()

    const handleSelect = event => {
        console.log(event)
    }

    useEffect(() => {
        const interval = setInterval(() => {

            let shadowH = Math.random() * (94 - 90) + 90
            let close = Math.random() * (92 - 90) + 90

            const itemUpdate = { x: 47, shadowH, shadowL: 90, open: 90, close }
            // var values = [...data.dataSets[0].values]
            // values[values.length - 1] = itemUpdate
            var values = [...data.dataSets[0].values]
            values.pop()
            values.push(itemUpdate)

            setData({
                ...data,
                dataSets: [{
                    ...data.dataSets[0],
                    values
                }]
            })

        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <View style={styles.container}>

            <CandleStickChart
                ref={refChart}
                style={styles.chart}
                data={data}
                marker={marker}
                chartDescription={{ text: 'CandleStick' }}
                legend={legend}
                xAxis={xAxis}
                yAxis={yAxis}
                maxVisibleValueCount={16}
                autoScaleMinMaxEnabled={true}
                zoom={{ scaleX: 2, scaleY: 1, xValue: 400000, yValue: 1 }}
                // zoom={{ scaleX: 15.41, scaleY: 1, xValue: 40, yValue: 916, axisDependency: 'LEFT' }}
                onSelect={handleSelect}
                onChange={(event) => console.log(event.nativeEvent)}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    chart: {
        flex: 1
    }
})

export default CandleScreen