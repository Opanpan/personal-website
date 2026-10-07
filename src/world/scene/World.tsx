import React from 'react';
import Environment from './Environment';
import Island from './Island';
import Landmarks from './Landmarks';
import Nature from './Nature';
import Markers, { ZoneLabels } from './Markers';
import Player from './Player';
import SkillOrbs from './SkillOrbs';
import Life from './Life';
import Effects from './Effects';
import { Quality } from '../store';

export default function World({ night, quality }: { night: boolean; quality: Quality }) {
  return (
    <>
      <Environment night={night} />
      <Island night={night} />
      <Nature quality={quality} />
      <Landmarks night={night} />
      <Life quality={quality} night={night} />
      <SkillOrbs />
      <Markers />
      <ZoneLabels />
      <Player />
      {quality === 'high' && <Effects night={night} />}
    </>
  );
}
