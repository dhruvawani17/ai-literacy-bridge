/**
 * Firebase Error Handler Component
 * Displays helpful error messages when Firebase encounters permission issues
 */

'use client'

import React from 'react'
import { AlertCircle, ExternalLink, Shield, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FirebaseErrorProps {
  error: {
    code?: string
    message?: string
  }
  context?: string
}

export default function FirebaseError({ error, context }: FirebaseErrorProps) {
  const isPermissionError = error.code === 'permission-denied' || 
                           error.message?.includes('permission')

  if (!isPermissionError) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          Firebase Permission Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-2">
            <strong>What happened:</strong> The app tried to {context || 'access the database'}, 
            but Firestore security rules prevented the operation.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-orange-600" />
            Quick Fix
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Open your terminal</li>
            <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">firebase login</code></li>
            <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">firebase deploy --only firestore:rules</code></li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
            onClick={() => window.open('/FIREBASE_SETUP.md', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Setup Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
            onClick={() => window.open('https://console.firebase.google.com', '_blank')}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Firebase Console
          </Button>
        </div>

        <div className="text-xs text-orange-600 bg-orange-100 p-3 rounded">
          <strong>Development Mode:</strong> The app will continue to work with mock data. 
          This is for development only and won't save any real data.
        </div>

        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-medium">Technical Details</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

// Compact inline version for smaller spaces
export function FirebaseErrorInline({ error }: { error: any }) {
  const isPermissionError = error?.code === 'permission-denied'
  
  if (!isPermissionError) return null

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
      <div className="flex items-start">
        <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-orange-800 font-medium">Firebase permissions not configured</p>
          <p className="text-orange-700 text-xs mt-1">
            Run <code className="bg-orange-100 px-1 rounded">firebase deploy --only firestore:rules</code> to fix this.
            {' '}
            <a 
              href="/FIREBASE_SETUP.md" 
              target="_blank"
              className="underline hover:text-orange-900"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
