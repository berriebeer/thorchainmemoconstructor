'use client'

import { useState, useEffect } from 'react'
import { Copy, Coins, Wallet, Coffee, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const assets = [
  { id: 'AVAX', name: 'Avalanche (AVAX)', shortName: 'a', chainAsset: 'AVAX.AVAX' },
  { id: 'BTC', name: 'Bitcoin (BTC)', shortName: 'b', chainAsset: 'BTC.BTC' },
  { id: 'BCH', name: 'Bitcoin Cash (BCH)', shortName: 'c', chainAsset: 'BCH.BCH' },
  { id: 'ETH', name: 'Ethereum (ETH)', shortName: 'e', chainAsset: 'ETH.ETH' },
  { id: 'ATOM', name: 'Cosmos (ATOM)', shortName: 'g', chainAsset: 'GAIA.ATOM' },
  { id: 'BNB', name: 'Binance Coin (BNB)', shortName: 's', chainAsset: 'BSC.BNB' },
  { id: 'DOGE', name: 'Dogecoin (DOGE)', shortName: 'd', chainAsset: 'DOGE.DOGE' },
  { id: 'LTC', name: 'Litecoin (LTC)', shortName: 'l', chainAsset: 'LTC.LTC' },
  { id: 'RUNE', name: 'Thorchain (RUNE)', shortName: 'r', chainAsset: 'THOR.RUNE' }
]

const donationAddresses = {
  'BTC': 'bc1qunw4qr844g3qg306lymmnylnv3l7vees53vpna',
  'ETH': '0x7dD4059b83A9A0C24F0d358B5D751Fd6b1e8C101',
  'RUNE': 'thor1xnam06nqut9ns8d7eqm7h2uhmqd8hagjv5chkp'
}

export function MemoConstructor() {
  const [action, setAction] = useState('add')
  const [selectedAsset, setSelectedAsset] = useState('')
  const [assetAddress, setAssetAddress] = useState('')
  const [runeAddress, setRuneAddress] = useState('')
  const [inboundAddresses, setInboundAddresses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [basisPoints, setBasisPoints] = useState(10000)
  const [withdrawalType, setWithdrawalType] = useState('both')
  const [donationAsset, setDonationAsset] = useState('RUNE')
  const [copiedStates, setCopiedStates] = useState({})

  useEffect(() => {
    const fetchInboundAddresses = async () => {
      try {
        const response = await fetch('https://thornode.ninerealms.com/thorchain/inbound_addresses')
        if (!response.ok) {
          throw new Error('Failed to fetch inbound addresses')
        }
        const data = await response.json()
        const addressMap = {}
        data.forEach(item => {
          addressMap[item.chain] = {
            address: item.address,
          }
        })
        setInboundAddresses(addressMap)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchInboundAddresses()
  }, [])

  const getChainAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    return asset ? asset.chainAsset : ''
  }

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    return asset ? asset.name : ''
  }

  const getMemo = (isAsset: boolean) => {
    if (action === 'add') {
      const prefix = '+'
      const asset = getChainAsset(selectedAsset)
      return `${prefix}:${asset}:${isAsset ? runeAddress : assetAddress}`
    } else {
      const prefix = '-'
      const asset = getChainAsset(selectedAsset)
      let memo = `${prefix}:${asset}:${basisPoints}`
      if (withdrawalType !== 'both') {
        const withdrawAsset = withdrawalType === 'rune' ? 'THOR.RUNE' : asset
        memo += `:${withdrawAsset}`
      }
      return memo
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderCopyableField = (label: string, value: string, key: string) => (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto">
          <code className="bg-[#0f1218] p-2 rounded text-sm whitespace-nowrap inline-block min-w-full">{value}</code>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(value, key)}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                {copiedStates[key] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedStates[key] ? 'Copied!' : 'Copy to clipboard'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  const renderTransactionSection = (isAsset: boolean) => (
    <Card className="bg-[#141920] border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm text-gray-400">
          {action === 'add' ? (isAsset ? `${selectedAsset} Transaction` : "RUNE Transaction") : "RUNE Transaction"}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          {action === 'add'
            ? (isAsset
              ? `Send ${selectedAsset} to the inbound address below with this memo`
              : "Send RUNE through the FUNCTION 'Custom' in Vultisig with this memo")
            : (
              <>
                <p>Withdraw liquidity from the {getAssetName(selectedAsset)} pool. Make sure to do the transaction from the RUNE address that you have provided the initial liquidity with.</p>
                <p className="mt-2 font-semibold">Note: If you deposit asymmetrically you can ONLY withdraw asymmetrically.</p>
              </>
            )
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {action === 'withdraw' && !isAsset && renderCopyableField('Amount', '0.00001', 'withdrawAmount')}
        {renderCopyableField('Memo', getMemo(isAsset), `memo${isAsset ? 'Asset' : 'Rune'}`)}
        {action === 'add' && isAsset && inboundAddresses[selectedAsset] && renderCopyableField(`${selectedAsset} Inbound Address`, inboundAddresses[selectedAsset].address, 'inboundAddress')}
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="min-h-screen dark bg-[#0f1218] text-white flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen dark bg-[#0f1218] text-white flex items-center justify-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark bg-[#0f1218] text-white">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="text-blue-400 mb-4">⇄</div>
          <h1 className="text-2xl font-bold mb-2 text-center">Thorchain LP Memo Constructor</h1>
          <div className="text-sm text-gray-400 text-center">
            <p>Generate memos for providing liquidity on Thorchain through Vultisig!</p>
            <p className="mt-2">
              Use at your own risk. Dev docs here:{' '}
              <a href="https://dev.thorchain.org/concepts/memos.html" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                https://dev.thorchain.org/concepts/memos.html
              </a>
            </p>
            <p className="mt-2">
              Made by{' '}
              <a 
                href="https://x.com/GerardsHabeel" 
                className="text-blue-400 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Habeel Gerards
              </a>
            </p>
          </div>
        </div>

        <div className="bg-[#1a1f2a] rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">1. Select Action</Label>
            <RadioGroup value={action} onValueChange={setAction} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add">Add Liquidity</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withdraw" id="withdraw" />
                <Label htmlFor="withdraw">Withdraw Liquidity</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-400">2. Select Asset</Label>
            <Select onValueChange={setSelectedAsset}>
              <SelectTrigger className="bg-[#141920] border-gray-700">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets
                  .filter(asset => asset.id !== 'RUNE')
                  .map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {action === 'add' && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>3. Your {selectedAsset || 'Asset'} Address</span>
                </Label>
                <Input
                  className="bg-[#141920] border-gray-700"
                  placeholder={`Enter ${selectedAsset || 'asset'} address`}
                  value={assetAddress}
                  onChange={(e) => setAssetAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-400 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>4. Your RUNE Address</span>
                </Label>
                <Input
                  className="bg-[#141920] border-gray-700"
                  placeholder="Enter your RUNE address"
                  value={runeAddress}
                  onChange={(e) => setRuneAddress(e.target.value)}
                />
              </div>
            </>
          )}

          {action === 'withdraw' && 
            <>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">3. Withdrawal Type</Label>
                <RadioGroup defaultValue="both" onValueChange={setWithdrawalType} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">RUNE + {selectedAsset || 'select an asset'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rune" id="rune" />
                    <Label htmlFor="rune">RUNE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asset" id="asset" />
                    <Label htmlFor="asset">{selectedAsset || 'select an asset'}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-400">4. Withdrawal Percentage</Label>
                <Slider
                  min={1}
                  max={10000}
                  step={1}
                  value={[basisPoints]}
                  onValueChange={(value) => setBasisPoints(value[0])}
                className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-400">{(basisPoints / 100).toFixed(2)}%</p>
                  <div className="space-x-2">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        onClick={() => setBasisPoints(percent * 100)}
                        className="text-xs"
                      >
                        {percent === 100 ? 'MAX' : `${percent}%`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          }

          {selectedAsset && (action === 'add' ? (assetAddress && runeAddress) : true) && (
            <div className="space-y-4">
              <Label className="text-sm text-gray-400">{action === 'add' ? '5' : '5'}. Transactions</Label>
              {action === 'add' && (
                <p className="text-sm text-gray-400 mb-4">
                  If you want to provide liquidity symmetrically, send the same dollar value of RUNE and {selectedAsset}. 
                  If you provide liquidity asymmetrically, the amount will be rebalanced 50:50.
                </p>
              )}
              {action === 'add' ? (
                <>
                  {renderTransactionSection(true)}
                  {renderTransactionSection(false)}
                </>
              ) : (
                renderTransactionSection(false)
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#141920] py-4 mt-8">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Coffee className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-400 font-medium">Buy me a coffee</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
            <Select onValueChange={setDonationAsset} value={donationAsset}>
              <SelectTrigger className="w-full sm:w-[120px] bg-[#1a1f2a] border-gray-700">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 overflow-x-auto">
                <code className="bg-[#0f1218] p-2 rounded text-sm whitespace-nowrap inline-block min-w-full">{donationAddresses[donationAsset]}</code>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(donationAddresses[donationAsset], 'donationAddress')}
                      className="text-gray-400 hover:text-white flex-shrink-0"
                    >
                      {copiedStates['donationAddress'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copiedStates['donationAddress'] ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}