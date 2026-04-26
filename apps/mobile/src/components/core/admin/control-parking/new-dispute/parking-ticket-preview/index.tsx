/* eslint-disable max-lines-per-function */
import { Image } from 'react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  type DetailRowProps,
  type ParkingTicketPreviewProps,
  type SectionProps,
} from './types';

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View className="flex-row justify-between border-b border-gray/20 py-2">
    <Text className="text-base font-medium text-text">{label}</Text>
    <Text className="shrink text-right text-base text-text">
      {value ?? '-'}
    </Text>
  </View>
);

const Section: React.FC<SectionProps> = ({ title, content }) => (
  <View className="border-b border-gray/10 py-3">
    <Text className="text-gray-700 text-base font-medium">{title}</Text>
    <Text className="text-gray-800 mt-1 text-base">{content ?? '...'}</Text>
  </View>
);

export const ParkingTicketPreview: React.FC<ParkingTicketPreviewProps> = ({
  violation,
  town,
  locationViolation,
  formData,
}) => {
  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '####-##-## ##:##';
    return new Date(timestamp).toLocaleString('sv-SE');
  };

  const title = violation?.label || '######## #######';
  const townLabel = town?.label || '##############';
  const price = locationViolation?.price || '###';
  const osr = Date.now().toString().slice(-10) || '############';
  const vehicle = formData?.reference || '####';
  const fabric = formData?.mark || '####';
  const issuer = 'Crewsec AB'; // Or fetch from user data if needed
  const fromDateTime = formatDateTime(formData?.startDate);
  const toDateTime = formatDateTime(formData?.endDate);

  // You can store these values in environment variables or a config file
  const plusgiro = '123-4567';
  const iban = 'SE12 3456 7890 1234 5678 9012';
  const swift = 'SWEDSESS';

  return (
    <ScrollView contentContainerClassName="p-4 bg-white">
      <View>
        <Image
          source={require('assets/splash-icon.png')}
          className="h-40 w-4/5 self-center"
          resizeMode="cover"
        />

        <Text className="my-6 border-t border-gray/60 pt-3 text-center text-xl font-bold text-black">
          KONTROLLAVGIFT
        </Text>

        <View className="mb-4">
          <DetailRow label="Ärendenr/OCR" value={osr} />
          <DetailRow label="Utfärdat av:" value={issuer} />
          <DetailRow label="Reg.nr:" value={vehicle} />
          <DetailRow label="Fabrikat:" value={fabric} />
          <DetailRow label="Från:" value={fromDateTime} />
          <DetailRow label="Till:" value={toDateTime} />
        </View>

        <Section title="Plats/Adress" content={townLabel} />
        <DetailRow label="Belopp:" value={`${price} kr`} />
        <Section title="Överträdelse:" content={title} />
        <DetailRow
          label="Vägmarkering kontrollerad:"
          value={formData?.isSignsChecked ? 'JA' : 'NEJ'}
        />
        <DetailRow
          label="Foto tagen:"
          value={formData?.isPhotosTaken ? 'JA' : 'NEJ'}
        />

        <View className="bg-gray-200 my-2 h-px" />

        <View className="my-2 space-y-4">
          <Text className="text-gray-700 text-sm leading-5">
            Fordonet har varit uppställt i strid mot gällande bestämmelser
            enligt texten på Kontrollavgiften ({title}). Varför en avgift om{' '}
            {price} kr uttages.
          </Text>
          <Text className="text-gray-700 text-sm leading-5">
            Avgiften skall erläggas inom 8 dagar till plusgiro {plusgiro}. Vid
            betalning måste debiteringsnummer (=OCR nr) {osr} anges för giltig
            betalning.
          </Text>
          <Text className="text-gray-700 text-sm leading-5">
            Eventuell invändningar ska göras till CREWSEC AB.
            {'\n'}
            http://crewsec.se{'\n'}
            Tel 0107079759 Mån-Fre 08:30-16:30
          </Text>
          <Text className="text-gray-700 text-sm leading-5">
            Uppgifter på denna kontrollavgiftsfaktura behandlas enligt
            dataskyddsförordningen.
          </Text>
          <Text className="text-gray-700 text-sm leading-5">
            For payment from abroad, please use SWIFT and IBAN. Enter the OCR
            number and the Registrator number when paying.
          </Text>
        </View>

        <View className="mt-4">
          <DetailRow label="Iban:" value={iban} />
          <DetailRow label="Swift:" value={swift} />
        </View>
      </View>
    </ScrollView>
  );
};
