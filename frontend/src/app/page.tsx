'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface TrainData {
  id: number;
  departure_time: string;
  arrival_time: string;
  destination: string;
}

export default function Home() {
  //仮の電車データ
  // const trainSchedule = [
  //   {
  //     id: 1,
  //     status: 'On Time',
  //   },
  //   {
  //     id: 2,
  //     status: 'Slight Delay',
  //   },
  //   {
  //     id: 3,
  //     status: 'Significant Delay',
  //   },
  // ];

  //電車のステータスによって背景色を変える
  // const getDelayColor = (status: string) => {
  //   switch (status) {
  //     case 'On Time':
  //       return 'bg-green-100 text-green-800';
  //     case 'Slight Delay':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'Significant Delay':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };
  //天気情報に関する変数の状態管理
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [dialogCurrentLocation, setDialogCurrentLocation] = useState('');
  const [dialogDestination, setDialogDestinaiton] = useState('');
  const [currentWeather, setCurrentWeather] = useState('');
  const [destinationWeather, setDestinationWeather] = useState('');
  //電車情報に関する変数の状態管理
  const [boardingStation, setBoardingStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogBoardingStation, setDialogBoardingStation] = useState('');
  const [dialogArrivalStation, setDialogArrivalStation] = useState('');
  const [trainData, setTrainData] = useState<TrainData[]>([]);

  useEffect(() => {
    if (isDialogOpen) {
      setDialogCurrentLocation(currentLocation);
      setDialogDestinaiton(destination);
      setDialogBoardingStation(boardingStation);
      setDialogArrivalStation(arrivalStation);
    }
  }, [
    isDialogOpen,
    currentLocation,
    destination,
    boardingStation,
    arrivalStation,
  ]);

  const handleSave = () => {
    setCurrentLocation(dialogCurrentLocation);
    setDestination(dialogDestination);
    setBoardingStation(dialogBoardingStation);
    setArrivalStation(dialogArrivalStation);
    setIsDialogOpen(false);
  };

  const fetchWeather = async () => {
    try {
      const responses = await Promise.all([
        fetch('http://127.0.0.1:5000/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: currentLocation }),
        }),
        fetch('http://127.0.0.1:5000/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: destination }),
        }),
      ]);

      const [currentLocationData, destinationData] = await Promise.all(
        responses.map((response) => {
          if (!response.ok) {
            return response.json().then((error) => {
              console.error('Error response from backend:', error);
              throw new Error(
                `Error fetching weather data for ${response.url}`
              );
            });
          }
          return response.json();
        })
      );

      setCurrentWeather(currentLocationData.list);
      setDestinationWeather(destinationData.list);
    } catch (error) {
      console.error(error);
      setCurrentWeather('エラーが発生しました');
      setDestinationWeather('エラーが発生しました');
    }
  };

  // スケジュールデータを取得
  const fetchSchedule = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/schedule', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch train schedule');
      }

      const scheduleData = await response.json();
      setTrainData(scheduleData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <main className='container mx-auto p-4 max-w-md'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-slate-800'>Move Sync</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' size='sm' className='text-slate-600'>
              設定
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>設定</DialogTitle>
              <DialogDescription>
                乗車駅や降車駅の設定をすることができます。
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='currentLocation' className='text-right'>
                  現在地
                </Label>
                <Input
                  id='currentLocation'
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='destination' className='text-right'>
                  目的地
                </Label>
                <Input
                  id='destination'
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='boardingStation' className='text-right'>
                  乗車駅
                </Label>
                <Input
                  id='boardingStation'
                  value={dialogBoardingStation}
                  onChange={(e) => setDialogBoardingStation(e.target.value)}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='arrivalStation' className='text-right'>
                  降車駅
                </Label>
                <Input
                  id='arrivalStation'
                  value={dialogArrivalStation}
                  onChange={(e) => setDialogArrivalStation(e.target.value)}
                  className='col-span-3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='bg-gray-200 text-gray-800 hover:bg-gray-300'
              >
                閉じる
              </Button>
              <Button type='button' onClick={handleSave}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='space-y-6'>
        <Card className='shadow-sm rounded-xl overflow-hidden'>
          <CardHeader className='bg-sky-100 border-b border-sky-200'>
            <CardTitle className='text-xl text-sky-800'>天気情報</CardTitle>
          </CardHeader>
          <CardContent className='p-6 space-y-6'>
            <div>
              <h3 className='font-semibold mb-2 text-lg text-slate-700'>
                現在地の天気: {currentLocation}
              </h3>
              <div className='flex space-x-4 overflow-x-auto'>
                {Array.isArray(currentWeather) && currentWeather.length > 0 ? (
                  currentWeather.map((forecast, index) => (
                    <div
                      key={`current-${index}`}
                      className='bg-slate-50 p-4 rounded-lg text-slate-600 shadow-inner w-35 flex-shrink-0'
                    >
                      <Image
                        src={`https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                        alt={forecast.weather[0].description}
                        className='mb-2'
                        width={40}
                        height={40}
                      />
                      <p className='text-sm'>{forecast.dt_txt.slice(11, 16)}</p>
                      <p className='text-sm'>
                        {forecast.weather[0].description}
                      </p>
                      <p className='text-sm'>
                        {Math.round(forecast.main.temp)}℃
                      </p>
                      <p className='text-sm'>湿度: {forecast.main.humidity}%</p>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-slate-600'>データがありません。</p>
                )}
              </div>
            </div>

            <Separator className='bg-slate-200' />

            <div>
              <h3 className='font-semibold mb-2 text-lg text-slate-700'>
                目的地の天気: {destination}
              </h3>
              <div className='flex space-x-4 overflow-x-auto'>
                {Array.isArray(destinationWeather) &&
                destinationWeather.length > 0 ? (
                  destinationWeather.map((forecast, index) => (
                    <div
                      key={`destination-${index}`}
                      className='bg-slate-50 p-4 rounded-lg text-slate-600 shadow-inner w-35 flex-shrink-0'
                    >
                      <Image
                        src={`https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                        alt={forecast.weather[0].description}
                        className='mb-2'
                        width={40}
                        height={40}
                      />
                      <p className='text-sm'>{forecast.dt_txt.slice(11, 16)}</p>
                      <p className='text-sm'>
                        {forecast.weather[0].description}
                      </p>
                      <p className='text-sm'>
                        {Math.round(forecast.main.temp)}℃
                      </p>
                      <p className='text-sm'>湿度: {forecast.main.humidity}%</p>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-slate-600'>データがありません。</p>
                )}
              </div>
            </div>

            <div className='flex justify-center mt-4'>
              <Button
                type='submit'
                variant='outline'
                size='lg'
                onClick={fetchWeather}
              >
                更新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm rounded-xl overflow-hidden'>
          <CardHeader className='bg-emerald-100 border-b border-emerald-200'>
            <CardTitle className='text-xl text-emerald-800'>電車情報</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              <div>
                <h2 className='font-semibold mb-3 text-lg text-slate-700'>
                  設定された経路
                </h2>
                <div className='bg-slate-50 p-4 rounded-lg'>
                  <p className='text-sm text-slate-600'>
                    乗車駅： {boardingStation}
                  </p>
                  <p className='text-sm text-slate-600'>
                    降車駅： {arrivalStation}
                  </p>
                  <p className='font-medium mt-2 text-lg text-slate-800'>
                    {boardingStation} → {arrivalStation}
                  </p>
                </div>
              </div>
              <Separator className='bg-slate-200' />
              <ul className='space-y-4'>
                {trainData.map((train, index) => (
                  <li
                    key={train.id || index}
                    className='bg-white p-4 rounded-lg shadow-sm border border-slate-200'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <span className='font-semibold text-lg text-slate-800'>
                        {train.departure_time} → {train.arrival_time}
                      </span>
                      <Badge
                        variant='secondary'
                        className='text-sm bg-slate-100 text-slate-600'
                      >
                        運賃： ¥300
                      </Badge>
                    </div>
                    <p className='text-sm text-slate-600 mb-3'>東西線</p>
                    <p className='text-sm text-slate-600 mb-3'>
                      {train.destination}方面
                    </p>
                    {/* <Badge className={`${getDelayColor(train.status)}`}>
                      {train.status}
                    </Badge> */}
                  </li>
                ))}
              </ul>
              <div className='flex justify-center mt-4'>
                <Button variant='outline' size='lg' onClick={fetchSchedule}>
                  更新
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
