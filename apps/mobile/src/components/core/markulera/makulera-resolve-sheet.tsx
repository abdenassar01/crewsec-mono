/* eslint-disable max-lines-per-function */
import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import {
  Image,
  Input,
  Modal,
  Text,
  TouchableOpacity,
  useModal,
  View,
} from '@/components/ui';
import { useUser } from '@/hooks';
import { useSafeMutation } from '@/hooks/use-convex-hooks';
import { cn } from '@/lib/helpers';

interface Props {
  id: Id<'canceledViolations'>;
  isResolved: boolean;
}

export function MakuleraResolveSheet({ id, isResolved }: Props) {
  const { present, ref, dismiss } = useModal();
  const { t } = useTranslation();
  const [resolved, setResolved] = useState<boolean>(isResolved);
  const [notes, setNotes] = useState<string>('');
  const { user } = useUser();
  const resolveMutation = useSafeMutation(
    api.canceledViolations.resolveViolation,
  );

  const handleResolve = async () => {
    try {
      await resolveMutation({ id, notes });
      setResolved(true);
      showMessage({
        type: 'success',
        message: 'Makulera resolved successfully',
      });
      dismiss();
      setNotes('');
    } catch (error) {
      showMessage({
        type: 'danger',
        message:
          error instanceof Error ? error.message : 'Failed to resolve makulera',
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={present}
        className={cn(
          'rounded-full p-1.5',
          resolved ? 'bg-green-500' : 'bg-blue-500',
        )}
        disabled={resolved || user?.role !== 'ADMIN'}
      >
        {resolved ? (
          <Image className="size-4" source={require('assets/icons/done.png')} />
        ) : user?.role === 'ADMIN' ? (
          <Image className="size-4" source={require('assets/icons/view.png')} />
        ) : (
          <Image
            className="size-4"
            source={require('assets/icons/awaiting.png')}
          />
        )}
      </TouchableOpacity>

      <Modal index={0} snapPoints={['35%', '50%']} detached ref={ref}>
        <View className="justify-center p-4">
          {/* Header */}
          <View className="mb-4 flex-row items-center gap-3">
            <View className="rounded-full bg-blue-500/20 p-2">
              <Image
                className="size-5"
                source={require('assets/icons/view.png')}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text text-base font-semibold dark:text-gray-100">
                {t('resolve')} Makulera
              </Text>
              <Text className="text-xs text-gray-500">
                {resolved ? 'Already resolved' : 'Add resolution notes'}
              </Text>
            </View>
          </View>

          <View className="mb-4 gap-3">
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Notes
            </Text>
            <Input
              className="min-h-[80px] rounded-xl border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Optional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
              editable={!resolved}
            />
          </View>

          {!resolved && (
            <View className="mt-7 flex-row gap-3">
              <TouchableOpacity
                onPress={dismiss}
                className="flex-1 items-center justify-center rounded-xl bg-gray-100 py-3 dark:bg-gray-800"
              >
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResolve}
                className="bg-secondary flex-1 items-center justify-center rounded-xl py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  {t('resolve')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {resolved && (
            <TouchableOpacity
              onPress={dismiss}
              className="items-center justify-center rounded-xl bg-green-500 py-3"
            >
              <Text className="text-sm font-semibold text-white">Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </>
  );
}
