import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: React.JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Free & Fair Consensus',
    description: (
      <>
        Energy-intensive mining and capital-intensive staking are replaced with a new form of disk-based farming.
      </>
    ),
  },
  {
    title: 'No Compromises Scalability',
    description: (
      <>
        We leverage key academic research to achieve Internet scale without sacrificing security or decentralization.
      </>
    ),
  },
  {
    title: 'Radically Decentralized',
    description: (
      <>
        Designed from first-principles for maximum decentralization, community ownership and on-chain governance.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
