import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, processColor } from 'react-native'
import { BarChart } from 'react-native-charts-wrapper'

const RED = processColor('#ff1c1c')
const GREEN = processColor('#1ea60f')

const BarChartEx = () => {

    const [barData, setBarData] = useState({
        dataSets: [{
            values: [
                { y: 80 },
                { y: 20 },
                { y: 10 },
                { y: 50 },
                { y: 70 },
                { y: 100 },
                { y: 40 },
                { y: 30 },
                { y: 60 },
                { y: 10 },
                { y: 30 },
                { y: 60 }
            ],
            label: '',
            config: {
                drawValues: false,
                colors: [RED, GREEN],
                drawLabels: false
            }
        }]

    })
    const [zoom, setZoom] = useState({ scaleX: 1.5, scaleY: 1.5, xValue: 0, yValue: 0, axisDependency: 'RIGHT' })
    const [xAxis, setXAxis] = useState({
        drawLabels: true,
        position: 'BOTTOM',
        granularity: 1,
        granularityEnabled: true,
        valueFormatter: 'date',
        valueFormatterPattern: 'mm:ss',
        since: 0,
        timeUnit: 'SECONDS'
    })

    useEffect(() => {
        let interval = setInterval(() => {
            let rd = Math.random() * (100 - 10) + 10
            if (barData.dataSets[0]?.values.length < 30) {
                setBarData({
                    dataSets: [{
                        ...barData.dataSets[0],
                        values: barData.dataSets[0].values.concat({ y: rd })
                    }]
                })
            }
            // setZoom({ scaleX: 1.5, scaleY: 1.5, xValue: 0, yValue: 0, axisDependency: 'RIGHT' })
        }, 1000)

        return () => clearInterval(interval)
    }, [barData])

    return (
        <View style={styles.container}>
            <BarChart
                style={styles.chart}
                data={barData}
                zoom={zoom}
                identifier="volume"
                group="stock"
                syncX={true}
                syncY={false}
                visibleRange={{ x: { min: 1, max: 30 } }}
                chartDescription={{ text: '' }}
                // doubleTapToZoomEnabled={false}
                // dragDecelerationEnabled={false}
                xAxis={xAxis}
                yAxis={{ left: { enabled: false }, right: { position: 'INSIDE_CHART' } }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    chart: {
        flex: 1,
        backgroundColor: 'white'
    }
})

export default BarChartEx