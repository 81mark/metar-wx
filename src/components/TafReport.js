import React from 'react';
import moment from 'moment';

const TafReport = ({ taf, cat }) => {
	return (
		<div
			className={
				(cat === 'VFR' && 'card text-white bg-success mb-3') ||
				(cat === 'MVFR' && 'card text-white bg-primary mb-3') ||
				(cat === 'IFR' && 'card text-white bg-danger mb-3') ||
				(cat === 'LIFR' && 'card text-white bg-info mb-3')
			}
		>
			<div className='card-body'>
				<h5 className='card-title mb-4'>
					<span className='text-uppercase'> {taf.station.name}</span>
					<strong> {cat}</strong>
					<span className='float-right'> TAF</span>
				</h5>
				{taf.forecast.map((fc, index) => (
					<div key={index}>
						{fc.timestamp.from && (
							<>
								<div key={index} className='mb-2'>
									<span className='text-dark'>
										{moment(new Date(fc.timestamp.from)).format(
											' h:mm:a on DD/MM/YYYY'
										)}
									</span>
									<span className='text-dark'>
										{moment(new Date(fc.timestamp.to)).format(
											' - h:mm:a on DD/MM/YYYY'
										)}
									</span>
								</div>
								{fc.change?.indicator.text &&
									fc.change?.indicator.code !== 'FM' && (
										<h5>{fc.change.indicator.text}</h5>
									)}
								{fc.conditions.map((condition, index) => (
									<p key={index}>
										<strong>{condition.code}</strong>, expect {condition.text}.
									</p>
								))}

								{fc.visibility?.meters && (
									<>
										<p>
											<strong>Visibility</strong> {fc.visibility.meters} meters
										</p>
									</>
								)}

								{fc.clouds[0]?.code !== 'NSC' &&
									fc.clouds.map((cloud, index) => (
										<p key={index} className='text-light bg-dark p-2 rounded'>
											{cloud.text} clouds at {cloud.base_feet_agl} feet.
										</p>
									))}
								<hr />
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default TafReport;
