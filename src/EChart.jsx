import React,{useEffect,useRef} from 'react';
import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,DataZoomComponent,MarkPointComponent,AriaComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
echarts.use([LineChart,GridComponent,TooltipComponent,LegendComponent,DataZoomComponent,MarkPointComponent,AriaComponent,CanvasRenderer]);
export function disconnectCharts(group){echarts.disconnect(group);}
export default function EChart({option,group,label,className=''}){
 const element=useRef(null),instance=useRef(null);
 useEffect(()=>{const chart=echarts.init(element.current,null,{renderer:'canvas'});instance.current=chart;if(group){chart.group=group;echarts.connect(group);}const ro=new ResizeObserver(()=>{if(!chart.isDisposed())chart.resize()});ro.observe(element.current);return()=>{ro.disconnect();chart.dispose();instance.current=null}},[group]);
 useEffect(()=>{instance.current?.setOption(option,{replaceMerge:['series'],lazyUpdate:false})},[option]);
 return <div ref={element} role="img" aria-label={label} data-chart-library="echarts" className={`echarts-container ${className}`}/>;
}
