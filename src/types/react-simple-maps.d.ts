declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, MouseEvent } from 'react'

  export interface GeoProjectionConfig {
    scale?: number
    center?: [number, number]
    rotate?: [number, number, number]
    translate?: [number, number]
    precision?: number
  }

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: GeoProjectionConfig
    width?: number
    height?: number
    style?: React.CSSProperties
    children?: ReactNode
  }
  export const ComposableMap: ComponentType<ComposableMapProps>

  export interface GeographyProps {
    geography: any
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onClick?: (e: MouseEvent) => void
    onMouseEnter?: (e: MouseEvent) => void
    onMouseLeave?: (e: MouseEvent) => void
    fill?: string
    stroke?: string
    strokeWidth?: number
  }
  export const Geography: ComponentType<GeographyProps>

  export interface GeographiesProps {
    geography?: any
    children?: (props: { geographies: any[] }) => ReactNode
    parseGeographies?: (data: any) => any[]
  }
  export const Geographies: ComponentType<GeographiesProps>

  export interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
    onClick?: (e: MouseEvent) => void
    style?: React.CSSProperties
  }
  export const Marker: ComponentType<MarkerProps>

  export interface ZoomableGroupProps {
    children?: ReactNode
    zoom?: number
    center?: [number, number]
    minZoom?: number
    maxZoom?: number
    onMove?: (pos: { zoom: number; center: [number, number]; x?: number; y?: number; k?: number }) => void
    onMoveEnd?: (pos: { zoom: number; center: [number, number] }) => void
    style?: React.CSSProperties
  }
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
}

declare module 'topojson-client' {
  export function feature(topology: any, object: any): any
  export function mesh(topology: any, object: any, filter?: any): any
  export function neighbors(topology: any, object: any): any
}

declare module 'world-atlas/*' {
  const data: any
  export default data
}

declare module 'd3-geo' {
  export function geoEqualEarth(): any
  export function geoMercator(): any
  export function geoPath(): any
}