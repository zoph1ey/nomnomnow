'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location unavailable'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out'
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [])

  return state
}
