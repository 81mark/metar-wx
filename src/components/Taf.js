import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import lscache from 'lscache';

const token = process.env.REACT_APP_TOKEN;

const Taf = ({ cat, debouncedSearchTerm }) => {
	const [taf, setTaf] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState({ error: '', message: '' });

	const getTaf = useCallback(async () => {
		// Here we can put lscache GET runs once
		let cache = lscache.get('TAF-' + debouncedSearchTerm.toUpperCase());
		let noCache = false;

		// console.log('cache before TAF IF: ', cache);
		// console.log('debounce before TAF IF: ', debouncedSearchTerm);
		if (cache === null) {
			noCache = true;
			// console.log('noCache: ', noCache);
			// console.log('details: ', cache);

			try {
				const res = await axios.get(
					`https://api.checkwx.com/taf/${debouncedSearchTerm}/decoded`,
					{
						headers: {
							'X-API-Key': `${token}`,
						},
					}
				);

				if (res.data.data.length === 0 && debouncedSearchTerm.length === 4) {
					setError({
						error: 'No Airport Found',
						message: 'Please try a different airport by ICAO, eg EGKK',
					});
					setIsLoading(false);
				} else {
					setError({ error: '', message: '' });
					setTaf(res.data.data[0]);
					// set cache expires 15 min
					lscache.set(
						'TAF-' + debouncedSearchTerm.toUpperCase(),
						[res.data.data[0]],
						15
					);
					setIsLoading(false);
				}
			} catch (err) {
				setError({
					error: `Error, ${err.response.data.error} (${err.response.status})`,
					message: 'There was an error getting the TAF data from the server',
				});
				setIsLoading(false);
			}
		} else if (
			noCache === false &&
			'TAF-' + cache[0].icao === 'TAF-' + debouncedSearchTerm.toUpperCase()
		) {
			// console.log('This is from the cache');
			// console.log('test', cache[0]);
			setTaf(cache[0]);
			setIsLoading(false);
		}
	}, [debouncedSearchTerm]);

	useEffect(() => {
		if (debouncedSearchTerm && debouncedSearchTerm.length === 4) {
			getTaf();
		}
	}, [debouncedSearchTerm, getTaf]);

	return (
		<>
			{!isLoading && !error.error && (
				<>
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
													<strong>{condition.code}</strong>, expect{' '}
													{condition.text}.
												</p>
											))}

											{fc.visibility?.meters && (
												<>
													<p>
														<strong>Visibility</strong> {fc.visibility.meters}{' '}
														meters
													</p>
												</>
											)}

											{fc.clouds[0]?.code !== 'NSC' &&
												fc.clouds.map((cloud, index) => (
													<p
														key={index}
														className='text-light bg-dark p-2 rounded'
													>
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
				</>
			)}
		</>
	);
};

export default Taf;
