import React from 'react';

const Clouds = ({ data }) => {
	return (
		<>
			{!data.clouds
				? ''
				: data.clouds.map((cloud, index) =>
						cloud.code === 'CAVOK' ||
						cloud.code === 'CLR' ||
						cloud.code === 'SKC' ? (
							<div key={index} className='card text-white bg-primary mb-3'>
								<div className='card-body'>
									<p className='text-center font-weight-bold text-uppercase m-0'>
										{cloud.text}
									</p>
								</div>
							</div>
						) : (
							<div key={index} className='card text-white bg-dark mb-3'>
								<div className='card-body'>
									<p className='card-text'>
										{cloud.text} clouds at {cloud.base_feet_agl} feet{' '}
										<span className='small'>(AGL)</span>
									</p>
								</div>
							</div>
						)
				  )}
		</>
	);
};

export default Clouds;
